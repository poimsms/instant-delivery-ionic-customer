import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';
import { AlertController } from '@ionic/angular';

import { Store } from '@ngrx/store'
import * as fromAuth from '../../store/reducers/auth';

@Component({
  selector: 'app-verify-phone',
  templateUrl: './verify-phone.page.html',
  styleUrls: ['./verify-phone.page.scss'],
})
export class VerifyPhonePage implements OnInit {
 
  code: string;
  counter = 90;
  textTime = '1:30';
  isLoading: boolean;

  constructor(
    public _auth: AuthService,
    private router: Router,
    public alertController: AlertController,
    private store: Store<fromAuth.State>
  ) { }

  ngOnInit() {
    this.resend_code_countdown();
    this.clear_autocomplete_input();
  }

  checkCodeFormat() {

    if (this.code.length < 4) {
      return;
    }

    const body = {
      code: this.code,
      phone: this._auth.phoneCode.phone,
      token: this._auth.sign_up_token,
      type: this._auth.phoneCode.type
    };

    this.isLoading = true;

    this._auth.phoneVerifyCode(body).then((res: any) => {

      this.isLoading = false;
      this.code = null;

      if (!res.ok) {
        return this.presentAlert(res.message);
      }

      if (res.type == 'SIGN_UP') {
        this._auth.sign_up_token = res.token;
        this.router.navigateByUrl('login-account');
      }

      if (res.type == 'SIGN_IN') {
        this._auth.saveStorage(res.token, res.user);
      }

    });
  }

  resend_code_countdown() {
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

  clear_autocomplete_input() {
    setTimeout(() => this.code = null, 200);
  }

  async presentAlert(message) {
    const alert = await this.alertController.create({
      header: 'Algo salio mal..',
      subHeader: message,
      buttons: ['OK']
    });

    await alert.present();
  }
}
