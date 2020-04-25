import { Injectable } from '@angular/core';
import { Platform } from '@ionic/angular';
import { Storage } from "@ionic/storage";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { BehaviorSubject } from "rxjs";
import { ConfigService } from './config.service';
import { Store } from '@ngrx/store';
import * as fromAuth from '../store/reducers/auth';
import * as Auth from '../store/actions/auth';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  phoneCode: {
    type: string,
    id: string,
    phone: number
  };

  sign_up_token: string;
  token: string;
  user: any;
  storage_counter = 0;

  constructor(
    private http: HttpClient,
    private platform: Platform,
    private storage: Storage,
    private _config: ConfigService,
    private store: Store<fromAuth.State>
  ) {
    this.store.select(fromAuth.getAuthState)
  }

  phoneNumberSendRequest(body) {
    const url = `${this._config.apiURL}/usuarios/request-code`;
    return this.http.post(url, body).toPromise();
  }

  phoneResendCode(body) {
    const url = `${this._config.apiURL}/usuarios/resend-code`;
    return this.http.post(url, body).toPromise();
  }

  phoneVerifyCode(body) {
    const url = `${this._config.apiURL}/usuarios/verify-code`;
    return this.http.post(url, body).toPromise();
  }

  registrarUsuario(body) {
    const url = `${this._config.apiURL}/usuarios/create-account`;
    return this.http.post(url, body).toPromise();
  }

  logout() {
    this.removeStorage();
    this.store.dispatch(new Auth.SetUnauthenticated())
  }

  saveFlowOrderStorage(order) {
    localStorage.setItem("order", JSON.stringify(order));
  }

  removeStorage() {
    if (this.platform.is("cordova")) {
      this.storage.remove("authData");
    } else {
      localStorage.removeItem("authData");
    }
  }

  saveStorage(token, user) {

    const authData = { token, uid: user._id };

    if (this.platform.is("cordova")) {
      this.storage.set("authData", JSON.stringify(authData));
    } else {
      localStorage.setItem("authData", JSON.stringify(authData));
    }

    const payload = { user, token }
    this.store.dispatch(new Auth.SetAuthenticated(payload))
  }

  getNativeStorage() {
    this.storage.get('authData').then(res => {

      if (!res) {
        return this.store.dispatch(new Auth.SetUnauthenticated());
      }

      const token = JSON.parse(res).token;
      const uid = JSON.parse(res).uid;

      this.getUser(token, uid).then(user => {
        const payload = { user, token }
        this.store.dispatch(new Auth.SetAuthenticated(payload))
      });
    });
  }

  loadStorage() {
    if (this.platform.is('cordova')) {
      setTimeout(() => this.getNativeStorage(), 500);
    } else {
      if (localStorage.getItem('authData')) {

        const res = localStorage.getItem('authData');
        const token = JSON.parse(res).token;
        const uid = JSON.parse(res).uid;

        this.getUser(token, uid).then(user => {
          const payload = { user, token }
          this.store.dispatch(new Auth.SetAuthenticated(payload))
        });

      } else {
        this.store.dispatch(new Auth.SetUnauthenticated())
      }
    }
  }

  getUser(token, id) {
    const url = `${this._config.apiURL}/usuarios/get-one?id=${id}`;
    const headers = new HttpHeaders({ token, version: this._config.version });
    return this.http.get(url, { headers }).toPromise();
  }

  updateUser(body) {
    const url = `${this._config.apiURL}/usuarios/update?id=${this.user._id}`;
    const headers = new HttpHeaders({ token: this.token, version: this._config.version });
    return this.http.put(url, body, { headers }).toPromise();
  }

  refreshUser() {
    return new Promise((resolve, reject) => {
      const url = `${this._config.apiURL}/usuarios/get-one?id=${this.user._id}`;
      const headers = new HttpHeaders({ token: this.token, version: this._config.version });
      this.http.get(url, { headers }).toPromise().then(user => {
        this.user = user;
        resolve(user);
      });
    });
  }

  updatePassword(body) {
    const url = `${this._config.apiURL}/usuarios/update-password?id=${this.user._id}`;
    const headers = new HttpHeaders({ token: this.token, version: this._config.version });
    return this.http.put(url, body, { headers }).toPromise();
  }

}