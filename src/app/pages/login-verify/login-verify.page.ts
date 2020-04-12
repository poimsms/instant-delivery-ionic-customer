import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';
import { ToastController } from '@ionic/angular';
import { AlertController } from '@ionic/angular';

import {Store} from '@ngrx/store'
import * as fromAuth from '../../store/reducers/auth';
import { Observable } from 'rxjs';


@Component({
  selector: 'app-login-verify',
  templateUrl: './login-verify.page.html',
  styleUrls: ['./login-verify.page.scss'],
})
export class LoginVerifyPage implements OnInit {
  codigo: string;
  counter = 90;
  textTime = '1:30';
  isAuthenticated$: Observable<boolean>;
  isLoading: boolean;

  constructor(
    public _auth: AuthService,
    private router: Router,
    private toastCtrl: ToastController,
    public alertController: AlertController,
    private store: Store<fromAuth.State>
  ) { }

  ngOnInit() {
    this.cuentaAtras();

    setTimeout(() => {
      this.codigo = null;
    }, 200);
  }

  checkCode() {

    this.isAuthenticated$ = this.store.select(fromAuth.getIsAuth)

    if (this.codigo.length < 4) {
      return;
    }

    const body = {
      codigo: this.codigo,
      telefono: this._auth.telefono,
      id: this._auth.id,
      tipo: this._auth.tipo
    };

    this.isLoading = true;

    this._auth.phoneVerifyCode(body).then((res: any) => {

      this.isLoading = false;
      this.codigo = null;

      if (!res.ok) {

        if (res.tipo == 'alert') {
          this.presentAlert(res.message);
        }

        if (res.tipo == 'toast') {
          this.toastPresent();
        }

        return;
      }

      if (res.tipo == 'crear_cuenta') {
        this._auth.tokenPhone = res.tokenPhone;
        this.router.navigateByUrl('login-account');
      }

      if (res.tipo == 'autenticar_usuario') {
        this._auth.saveStorage(res.token, res.usuario);
      }

    });
  }

  cuentaAtras() {
    let id = setInterval(() => {
      this.counter -= 1;
      if (this.counter == 0) {
        clearInterval(id);
      } else if (this.counter < 60) {
        this.textTime = `${this.counter}`;
      } else if (this.counter >= 60 && this.counter < 70) {
        this.textTime = `1:0${this.counter - 60}`;
      } else {
        this.textTime = `1:${this.counter - 60}`;
      }
    }, 1000);
  }

  async presentAlert(message) {
    const alert = await this.alertController.create({
      header: 'Algo salio mal..',
      subHeader: message,
      buttons: ['OK']
    });

    await alert.present();
  }

  async toastPresent() {
    const toast = await this.toastCtrl.create({
      message: 'Código incorrecto',
      duration: 2500,
      position: 'middle'
    });
    toast.present();
  }
}
