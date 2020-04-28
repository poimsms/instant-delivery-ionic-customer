import { Component, OnInit } from '@angular/core';
import { NavParams, ModalController, PopoverController, ToastController, AlertController } from '@ionic/angular';
import { DataService } from 'src/app/services/data.service';
import { PagarService } from 'src/app/services/pagar.service';
import { FireService } from 'src/app/services/fire.service';
import { AuthService } from 'src/app/services/auth.service';
import { TripService } from 'src/app/services/trip.service';

@Component({
  selector: 'app-pay',
  templateUrl: './pay.component.html',
  styleUrls: ['./pay.component.scss'],
})

export class PayComponent implements OnInit {

  usuario: any;
  rider: any;
  isLoading = false;
  model: any;
  coupon: any;

  telefono_destino: string;
  nombre_destino: string;
  instrucciones = '';
  tiempo_entrega = '';

  constructor(
    public modalCtrl: ModalController,
    private navParams: NavParams,
    private _data: DataService,
    private _pagar: PagarService,
    private _fire: FireService,
    private _auth: AuthService,
    public popoverController: PopoverController,
    public toastController: ToastController,
    public alertController: AlertController,
    private _trip: TripService
  ) {
    this.usuario = this.navParams.get('data').usuario;
    this.rider = this.navParams.get('data').rider;
    this.model = this.navParams.get('model').monto;
  }

  ngOnInit() {
    this.clearAutocomplete();
  }

  async confirmar_envio() {

    const flow = {
      monto: this.model.price_promo,
      email: this.usuario.email,
      usuario: this.usuario._id
    };

    const pedido: any = {
      price_promo: this.model.price_promo,
      price: this.model.price,
      payment_method: this.model.payment_method,
      distancia: this.model.distance,
      origin: this.model.origin,
      destination: this.model.destination,
      rider: this.rider._id,
      customer: this.usuario._id,
      destination_phone: this.telefono_destino,
      nombre_destino: this.nombre_destino,
      details: this.instrucciones,
      from: 'CUSTOMER_MOBILE_APP'
    };

    this.isLoading = true;

    if (this.model.payment_method === 'CARD') {

      if (this.model.price_promo <= 350) {
        this.isLoading = false;
        return this.alert_monto_minimo();
      }

      this._pagar.pagarConFlow(flow).then(pagoExitoso => {
        if (pagoExitoso) {
          this._data.crearPedido(pedido).then((pedido: any) => {
            this.save();
          });
        } else {
          this.close();
        }
      });
    }

    if (this.model.payment_method == 'CASH') {

      this._data.crearPedido(pedido).then((pedido: any) => {
        this.save();
      });
    }
  }

  async save() {

    if (this.coupon) {

      this.isLoading = true;

      this._data.useCupon(this.coupon._id).then(() => {
        this._trip.loadCoupon();
        this.isLoading = false;
        this.modalCtrl.dismiss({ status: 'PAGO_EXITOSO', riderID: this.rider._id, tiempoExpirado: false });
      });

    } else {
      this.modalCtrl.dismiss({ status: 'PAGO_EXITOSO', riderID: this.rider._id, tiempoExpirado: false });
    }
  }

  close() {
    this.modalCtrl.dismiss({ status: 'PAGO_NO_REALIZADO' });
  }


  async onAddCoupon() {
    const alert = await this.alertController.create({
      header: 'Código promo',
      subHeader: 'Ingresa acá tu Código Promo de Moviapp',
      inputs: [
        {
          name: 'codigo',
          type: 'text',
          placeholder: ''
        }
      ],
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
          cssClass: 'secondary',
          handler: () => {
            console.log('Confirm Cancel');
          }
        }, {
          text: 'Ok',
          handler: (data) => {
            this.couponHandler(data.codigo);
          }
        }
      ]
    });

    await alert.present();
  }

  couponHandler(codigo) {
    const body = {
      usuario: this._auth.user._id,
      codigo: codigo.toLowerCase()
    };

    this.isLoading = true;

    this._data.addCupon(body).then((res: any) => {

      this.isLoading = false;

      if (!res.ok) {
        return this.toast(res.message);
      }

      this._trip.loadCoupon();
    });
  }


  async toast(message) {
    const toast = await this.toastController.create({
      message: message,
      duration: 2500,
      position: 'middle'
    });
    toast.present();
  }

  clearAutocomplete() {
    setTimeout(() => {
      this.nombre_destino = null;
      this.telefono_destino = null;
    }, 200);
  }

  async alert_monto_minimo() {
    const alert = await this.alertController.create({
      header: 'Monto inválido',
      message: 'Recuerda que el monto mínimo a pagar con TARJETA son $350 CLP.',
      buttons: [
        {
          text: 'Ok',
          role: 'cancel',
          cssClass: 'secondary',
          handler: (blah) => {
          }
        }
      ]
    });

    await alert.present();
  }


}
