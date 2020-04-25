import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/services/auth.service';
import { ToastController } from '@ionic/angular';
import { Router } from '@angular/router';

@Component({
  selector: 'app-create-account',
  templateUrl: './create-account.page.html',
  styleUrls: ['./create-account.page.scss'],
})
export class CreateAccountPage implements OnInit {

  first_name: string;
  last_name: string;
  email: string;
  isLoading = false;

  constructor(
    private _auth: AuthService,
    private toastCtrl: ToastController,
    private router: Router
  ) {
  }

  ngOnInit() {
  }

  createAccount() {

    this.isLoading = true;

    if (!this.validateEmail(this.email)) {
      this.isLoading = false;
      return this.toastPresent('Email incorrecto');
    }

    const body = {
      name: this.first_name.toLowerCase().trim() + ' ' + this.last_name.toLowerCase().trim(),
      email: this.email.toLowerCase().trim(),
      phone: this._auth.phoneCode.phone,
      token: this._auth.sign_up_token
    }

    this._auth.registrarUsuario(body).then((res: any) => {

      if (!res.ok) {
        this.router.navigateByUrl(`login`);
      }

      this.isLoading = false;

      this._auth.saveStorage(res.token, res.user);

    }).catch(() => this.isLoading = false);

  }

  async toastPresent(text) {

    const toast = await this.toastCtrl.create({
      message: text,
      duration: 2500,
      position: 'middle'
    });

    toast.present();
  }

  validateEmail(email) {
    var re = /\S+@\S+\.\S+/;
    return re.test(email);
  }
}
