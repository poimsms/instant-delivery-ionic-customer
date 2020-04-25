import { Component, OnInit } from '@angular/core';
import { ToastController, ModalController } from '@ionic/angular';
import { AuthService } from 'src/app/services/auth.service';
import { Router } from '@angular/router';
import { PoliticasComponent } from 'src/app/components/politicas/politicas.component';
import { AlertController } from '@ionic/angular';
import { Store } from '@ngrx/store';
import * as fromAuth from '../../store/reducers/auth';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {

  phone: string;
  isLoading = false;

  err_9_digitos_telefono = false;
  err_num_telefono = false;

  acceptedPolicy = false;

  constructor(
    private _auth: AuthService,
    public toastController: ToastController,
    private router: Router,
    public modalController: ModalController,
    public alertController: AlertController,
    private store: Store<fromAuth.State>
  ) {  }

  ngOnInit() {
  }

  onNext() {

    if (!this.acceptedPolicy) {
      return;
    }

    this.resetErros();

    if (this.phone.length != 9) {
      return this.err_9_digitos_telefono = true;
    }

    if (!Number(this.phone)) {
      return this.err_num_telefono = true;
    }

    this.isLoading = true;

    const body = {
      phone: this.phone,
      from: 'customer-mobile-app'
    };
    
    this._auth.phoneNumberSendRequest(body).then((res: any) => {

      this.isLoading = false;

      if (!res.ok) {
        return this.presentAlert(res.message);
      }     

      this._auth.phoneCode= res;
      this.phone = null;

      this.router.navigateByUrl(`login-verify`);

    }).catch(() => this.isLoading = false);
  }

  policyToggle() {
    this.acceptedPolicy =  !this.acceptedPolicy;
  }

  resetErros() {
    this.err_9_digitos_telefono = false;
    this.err_num_telefono = false;
  }

  async openPoliticasModal() {

    const modal = await this.modalController.create({
      component: PoliticasComponent
    });

    await modal.present();
  }

  async presentAlert(message) {
    const alert = await this.alertController.create({
      header: 'Algo salio mal..',
      subHeader: message,
      buttons: ['OK']
    });

    await alert.present();
  }

  async presentToast() {
    const toast = await this.toastController.create({
      message: 'Ya fue enviado un SMS',
      duration: 2500,
      position: 'middle'
    });
    toast.present();
  }

}

