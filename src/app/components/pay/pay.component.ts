import { Component, OnInit } from '@angular/core';
import { NavParams, ModalController, PopoverController, ToastController, AlertController } from '@ionic/angular';
import { DataService } from 'src/app/services/data.service';
import { PagarService } from 'src/app/services/pagar.service';
import { FireService } from 'src/app/services/fire.service';
import { AuthService } from 'src/app/services/auth.service';

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
    public alertController: AlertController
  ) {
    this.usuario = this.navParams.get('data').usuario;
    this.rider = this.navParams.get('data').rider;
    this.model = this.navParams.get('model').monto;
    this.tiempo_entrega = this.navParams.get('data').pedido.tiempo;
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
      costo: this.model.price_promo,
      costo_real: this.model.price,
      metodo_de_pago: this.model.payment_method,
      distancia: this.model.distance,
      origen: this.model.origin,
      destino: this.model.destination,
      rider: this.rider._id,
      cliente: this.usuario._id,
      telefono_destino: this.telefono_destino,
      nombre_destino: this.nombre_destino,
      instrucciones: this.instrucciones,
      tiempo_entrega: this.tiempo_entrega,
      from: 'APP'
    };

    if (this._auth.user.role == 'EMPRESA_ROLE') {

      pedido.envio_pagado = false;
      pedido.pagar_productos = true;
      pedido.cobrar_productos = true;

      if (this.model.price == 0) {
        pedido.envio_pagado = true;
      }

    }

    this.isLoading = true;

    if (this.model.payment_method === 'Tarjeta') {

      if (this.model.price_promo <= 350) {
        this.isLoading = false;
        return this.alert_monto_minimo();
      }

      this._pagar.pagarConFlow(flow).then(pagoExitoso => {
          if (pagoExitoso) {
            this._data.crearPedido(pedido).then((pedido: any) => {
              this.save(pedido);
            });
          } else {
            this.close();
          }
      });
    }

    if (this.model.payment_method == 'Efectivo') {

      this._data.crearPedido(pedido).then((pedido: any) => {
        this.save(pedido);
      });
    }
  }

  async save(pedido) {

      await this.updateRiderEstadoOcupado(pedido._id); 

    if (this.coupon) {

      this.isLoading = true;

      this._data.useCupon(this.coupon._id).then(() => {
        this._data.getCuponActivo(this.usuario._id);
        this.isLoading = false;
        this.modalCtrl.dismiss({ status: 'PAGO_EXITOSO', riderID: this.rider._id, tiempoExpirado: false });
      });

    } else {
      this.modalCtrl.dismiss({ status: 'PAGO_EXITOSO', riderID: this.rider._id, tiempoExpirado: false });
    }
  }

  close() {
    this.updateRiderEstadoDisponible();
    this.modalCtrl.dismiss({ status: 'PAGO_NO_REALIZADO' });
  }

  updateRiderEstadoOcupado(pedidoId) {

    this._fire.updateRider(this.rider._id, 'rider', {
      fase: 'navegando_al_origen',
      pagoPendiente: false,
      actividad: 'ocupado',
      pedido: pedidoId,
      aceptadoId: '',
      evento: 1
    });

    this._fire.updateRider(this.rider._id, 'coors', {
      pagoPendiente: false,
      actividad: 'ocupado',
      pedido: pedidoId,
      cliente: this.usuario._id,
      evento: 1
    });
  }

  updateRiderEstadoDisponible() {
    this._fire.updateRider(this.rider._id, 'rider', {
      pagoPendiente: false,
      aceptadoId: '',
      cliente_activo: ''
    });
    this._fire.updateRider(this.rider._id, 'coors', {
      pagoPendiente: false
    });
  }

  async codigo_promo() {
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
            this.ingresar_codigo(data.codigo);
          }
        }
      ]
    });

    await alert.present();
  }

  ingresar_codigo(codigo) {
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

      this._data.getCuponActivo(this._auth.user._id);
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
