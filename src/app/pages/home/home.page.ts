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
import messages from '../../utils/messages';
import { RidersService } from 'src/app/services/riders.service';
import markerImages from 'src/app/utils/marker-urls';
import { TripService } from 'src/app/services/trip.service';

import * as fromMap from '../../store/reducers/map';
import * as Trip from '../../store/actions/trip';
import * as Map from '../../store/actions/map';

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

  setIcon = (icon, scale, origin, anchor) => {
    return {
      url: icon,
      scaledSize: new google.maps.Size(scale[0], scale[1]),
      origin: new google.maps.Point(origin[0], origin[1]),
      anchor: new google.maps.Point(anchor[0], anchor[1])
    }
  }

  gpsIcon = this.setIcon(markerImages.gps, [60, 60], [0, 0], [30, 30]);
  riderIcon = this.setIcon(markerImages.rider, [40, 40], [0, 0], [0, 32]);
  originIcon = this.setIcon(markerImages.gps, [34, 34], [0, 0], [16, 34]);
  destinationIcon = this.setIcon(markerImages.destination, [36, 36], [0, 0], [4, 36]);

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

    let options = { suppressMarkers: true, polylineOptions: { strokeColor: '#404042' } }

    this.service = new google.maps.DistanceMatrixService();
    this.directionsDisplay = new google.maps.DirectionsRenderer(options);
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

        this.displayRoute(state.origin, state.destination, state.gpsActived)

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
      this.store.dispatch(new Map.InitMap);
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
      return this.cancelOnSetUpTrip();
    }

    if (data.status === messages.payment.SUCCESS) {

      this.directionsDisplay.setMap(null);

      this.graciasPorComprar = true;

      setTimeout(() => {
        this.graciasPorComprar = false;
        const payload = {}
        this.store.dispatch(new Map.DisplayRoute())
        this.store.dispatch(new Trip.StartTrip(payload))
      }, 2000);
    }

    if (data.status === messages.payment.FAIL) {
      this.cancelOnSetUpTrip();
    }
  }

  async cancelOnSetUpTrip() {
    this.alert_pedido_cancelado();
    this.store.dispatch(new Map.InitMap)
    this.store.dispatch(new Trip.InitTrip)
  }

  async cancelOngoingTrip() {
    this.alert_pedido_cancelado();
    const data = {};
    await this._trip.cancelTrip(data);
    this.store.dispatch(new Map.InitMap)
    this.store.dispatch(new Trip.InitTrip)
  }

  openPayMethod() {
    this.router.navigateByUrl('metodo-pago');
  }

  async openUbicaciones() {
    this.router.navigateByUrl('direcciones');
  }

  vehicleToggle(vehicle) {
    this.model.vehicle = vehicle;
  }

  loadMap(coors) {
    this.map = new google.maps.Map(document.getElementById('map'), {
      center: coors,
      zoom: 16,
      disableDefaultUI: true
    });

    this.directionsDisplay.setMap(this.map);
  }

  displayRoute(origen, destino, gps) {

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

    if (gps) {
      const marker = this.markers.find(marker => marker.type === 'gps');
      marker.ref.setMap(null);
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
          handler: (blah) => {}
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
            this.cancelOngoingTrip();
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
