import { Component, OnInit, OnDestroy } from '@angular/core';
import { MenuController, ModalController, LoadingController, PopoverController, ToastController } from '@ionic/angular';
import { Router } from '@angular/router';
import { DataService } from 'src/app/services/data.service';
import { AlertController } from '@ionic/angular';
import { Subscription } from 'rxjs';
import { RatingComponent } from 'src/app/components/rating/rating.component';
import { PayComponent } from 'src/app/components/pay/pay.component';
import { CallNumber } from '@ionic-native/call-number/ngx';
import { Store } from '@ngrx/store';
import * as fromMap from '../../store/reducers/map';
import messages from '../../utils/messages';
import { RidersService } from 'src/app/services/riders.service';
import markerImages from 'src/app/utils/marker-urls';
import { TripService } from 'src/app/services/trip.service';

declare var google: any;

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})
export class HomePage implements OnInit, OnDestroy {

  map: any;
  service: any;
  directionsDisplay: any;
  directionsService: any;

  subs: Subscription[] = [];

  coupon: any;
  rider: any;
  model: any;

  graciasPorComprar = false;
  isLoading = false;

  gpsIcon = {
    url: markerImages.gps,
    scaledSize: new google.maps.Size(60, 60),
    origin: new google.maps.Point(0, 0),
    anchor: new google.maps.Point(30, 30)
  };

  riderIcon = {
    url: markerImages.rider,
    scaledSize: new google.maps.Size(40, 40),
    origin: new google.maps.Point(0, 0),
    anchor: new google.maps.Point(0, 32)
  };

  originIcon = {
    url: markerImages.origin,
    scaledSize: new google.maps.Size(34, 34),
    origin: new google.maps.Point(0, 0),
    anchor: new google.maps.Point(16, 34)
  };

  destinationIcon = {
    url: markerImages.destination,
    scaledSize: new google.maps.Size(36, 36),
    origin: new google.maps.Point(0, 0),
    anchor: new google.maps.Point(4, 36)
  };

  markers = [
    { type: 'origin', icon: this.originIcon, ref: null },
    { type: 'destination', icon: this.destinationIcon, ref: null },
    { type: 'gps', icon: this.gpsIcon, ref: null },
    { type: 'rider', icon: this.riderIcon, ref: null }
  ]

  constructor(
    private menu: MenuController,
    private router: Router,
    private _data: DataService,
    public alertController: AlertController,
    public modalController: ModalController,
    public loadingController: LoadingController,
    private callNumber: CallNumber,
    public popoverController: PopoverController,
    public toastController: ToastController,
    private store: Store<fromMap.State>,
    private _rider: RidersService,
    private _trip: TripService
  ) {
    this.service = new google.maps.DistanceMatrixService();
    this.directionsDisplay = new google.maps.DirectionsRenderer({
      suppressMarkers: true, polylineOptions: {
        strokeColor: '#404042'
      }
    });
    this.directionsService = new google.maps.DirectionsService();
  }

  ngOnInit() {

    this.subToMap();

    this.subs.push(
      this._trip.rider().subscribe(data => this.riderHandler(data)),
      this._trip.rate().subscribe(data => this.ratingHandler(data)),
      this._trip.coupon().subscribe(data => this.coupon = data),
      this.store.select(fromMap.getMapState).subscribe(data => this.model = data)
    )
  }

  ngOnDestroy() {
    this.subs.forEach(sub => sub.unsubscribe())
  }


  update(msg, model) {

    switch (msg.type) {
      case MSGS.SET_UP_TRIP:
        const { origin, destination, prices, times, distance } = msg;

        const trip = model.trip;
        trip.status = this.STATUS.IN_SETUP;

        return { ...model, origin, destination, prices, times, distance, trip }

      case MSGS.SET_VEHICLE:
        const { vehicle } = msg;
        return { ...model, vehicle }

      case MSGS.SET_PAYMENT_METHOD:
        const { payment_method } = msg;
        return { ...model, payment_method }

      case MSGS.START_TRIP:
        const trip = model.trip;
        const { origin, destination, prices, times, distance } = msg;

        trip.status = this.STATUS.IN_PROGRESS;
        return { ...model, trip }

      case MSGS.UPDATE_TRIP_STEP:
        const { step } = msg;
        const trip = model.trip;
        trip.step = step;
        return { ...model, trip }

      case MSGS.SHOW_TRIP_OPTIONS:
        const trip = model.trip;
        trip.showOptions = true;
        return { ...model, trip }

      case MSGS.CANCEL_TRIP:
        return this.initModel
    }

  }


  subToMap() {
    this.store.select(fromMap.getMapState).subscribe(async (state: any) => {

      if (state.displayRoute) {

        const data: any = await this._trip.getDistanceAndTime(state.origin, state.destination);

        const prices = await this._trip.getPrices(data.distance);

        const promo_prices = this._trip.applyCoupon(prices, this.coupon);

        const payload = {
          origin: state.origin,
          destination: state.destination,
          times: data.times,
          distance: data.distance,
          prices: promo_prices
        }

        this.store.dispatch(new Trip.StartTrip(payload))

        this.displayRoute(state.origin, state.destination)

        this.isLoading = true;
      }

      if (state.initMap) {

        this.directionsDisplay.setMap(null);
        this.map.setCenter(state.center);

        if (state.gpsActived)
          this.displayMarker(state.center, 'gps')
      }
    });
  }


  riderHandler(data) {

    const { riderCoors, startTracking, stopTracking } = data;

    if (startTracking)
      this.displayMarker(riderCoors, 'rider');

    if (stopTracking) {
      this.store.dispatch(new Map.ClearMap);
      this._trip.loadRate();
    }
  }

  async ratingHandler(rating) {

    const modal = await this.popoverController.create({
      component: RatingComponent,
      componentProps: { rating }
    });

    await modal.present();
  }


  async onConfirmRequest() {
    const modal = await this.modalController.create({
      component: PayComponent,
      componentProps: { data: this.model, coupon: this.coupon }
    });

    await modal.present();

    const { data } = await modal.onWillDismiss();

    if (!data) {
      return this.resetMapa();
    }

    if (data.status === messages.payment.SUCCESS) {

      this.directionsDisplay.setMap(null);

      this.service = new google.maps.DistanceMatrixService();
      this.directionsDisplay = new google.maps.DirectionsRenderer({
        suppressMarkers: true, polylineOptions: {
          strokeColor: '#404042'
        }
      });
      this.directionsService = new google.maps.DirectionsService();

      this.loadMap({ lat: 0, lng: 0 });

      this.graciasPorComprar = true;

      setTimeout(() => {
        this.graciasPorComprar = false;
        this._otros.getPedido('buscar_pedido_activo_mas_reciente');
      }, 2000);

      this._data.getCuponActivo(this._auth.user._id);

      this._fcm.sendPushNotification(data.riderID, 'confirmacion-pedido');

    }

    if (data.status === messages.payment.FAIL) {
      this.alert_pedido_cancelado();
    }

    if (data.status === messages.payment.TIMEOUT) {
      this.resetMapa();
    }
  }

  async cancelTrip() {
    const dta = {
      id: 'asdsa'
    }
    await this._trip.cancelTrip(data);
    this.store.dispatch(new Trip.CancelTrip);
    this.store.dispatch(new Map.ClearMap);
  }

  openPayMethod() {
    this.router.navigateByUrl('metodo-pago');
  }

  async openUbicaciones() {
    this.router.navigateByUrl('direcciones');
  }

  vehicleToggle(type) {
    this.model.vehicle = type;
  }

  loadMap(coors) {
    this.map = new google.maps.Map(document.getElementById('map'), {
      center: coors,
      zoom: 16,
      disableDefaultUI: true
    });

    this.directionsDisplay.setMap(this.map);
  }

  displayRoute(origen, destino) {

    this.directionsDisplay.setMap(this.map);
    const origenLatLng = new google.maps.LatLng(origen.lat, origen.lng);
    const destinoLatLng = new google.maps.LatLng(destino.lat, destino.lng);

    this.directionsService.route({
      origin: origenLatLng,
      destination: destinoLatLng,
      travelMode: 'DRIVING',
    }, (response, status) => {
      this.directionsDisplay.setDirections(response);
      this.isLoading = false;
    });

    if (this.gpsMarker) {
      this.gpsMarker.setMap(null);
    }

    this.displayMarker({ lat: origen.lat, lng: origen.lng }, 'origen');
    this.displayMarker({ lat: destino.lat, lng: destino.lng }, 'destino');
  }

  displayMarker(coors, type) {
    const index = this.markers.findIndex(marker => marker.type === type);

    let data = {
      position: coors,
      map: this.map,
      icon: this.markers[index].icon
    }

    this.markers[index].ref = new google.maps.Marker(data)
  }

  removeMarkers() {

    this.markers.forEach(marker => {
      if (marker.ref) marker.ref.setMap(null)
    });
  }

  async alert_pedido_cancelado() {
    const alert = await this.alertController.create({
      header: 'Pedido cancelado',
      message: 'Defina un nuevo trayecto!',
      buttons: [
        {
          text: 'Ok',
          role: 'cancel',
          cssClass: 'secondary',
          handler: (blah) => {
            this.resetMapaAndRider();
          }
        }
      ]
    });

    await alert.present();
  }


  async alert_cancelacion() {
    const alert = await this.alertController.create({
      header: 'Cancelar viaje',
      message: '¿Quieres cancelar el viaje?',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
          cssClass: 'secondary',
          handler: (blah) => {
          }
        },
        {
          text: 'Ok',
          handler: () => {
            this.cancelarViaje();
          }
        }
      ]
    });

    await alert.present();
  }

  async toast_pedido_completado() {
    const toast = await this.toastController.create({
      message: 'Pedido completado!',
      duration: 2500,
      position: 'middle'
    });
    toast.present();
  }

  openPage(page) {
    this._control.riderID = this.rider._id;
    this._control.pedido = this.pedido;
    this._control.pedidoID = this.pedido._id;

    this.router.navigateByUrl(page);
  }

  presentCompraExitosa() {
    this.graciasPorComprar = true;
    setTimeout(() => {
      this.graciasPorComprar = false;
    }, 2000);
  }

  openMenu() {
    this.menu.enable(true, 'first');
    this.menu.open('first');
  }

  callPhone(telefono) {
    this.callNumber.callNumber(telefono, true)
      .then(res => console.log('Launched dialer!', res))
      .catch(err => console.log('Error launching dialer', err));
  }
}
