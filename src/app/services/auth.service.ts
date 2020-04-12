import { Injectable } from '@angular/core';
import { Platform } from '@ionic/angular';
import { Storage } from "@ionic/storage";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { BehaviorSubject } from "rxjs";
import { ConfigService } from './config.service';
import { Store } from '@ngrx/store';
import * as fromApp from '../app.reducers';

import * as Auth from '../store/actions/auth';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  telefono: string;
  id: string;

  usuario: any;
  token: string;

  tipo: string;
  tokenPhone: string;

  storage_counter = 0;

  constructor(
    private http: HttpClient,
    private platform: Platform,
    private storage: Storage,
    private _config: ConfigService,
    private store: Store<{ ui: fromApp.State }>
  ) { }

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

  saveStorage(token, usuario) {

    const authData = { token, uid: usuario._id };
    this.usuario = usuario;
    this.token = token;

    if (this.platform.is("cordova")) {
      this.storage.set("authData", JSON.stringify(authData));
    } else {
      localStorage.setItem("authData", JSON.stringify(authData));
    }
        
    const payload = { usuario, token }
    this.store.dispatch(new Auth.SetAuthenticated(payload))
  }

  getNativeStorage() {
    this.storage.get('authData').then(res => {

      if (res) {

        const token = JSON.parse(res).token;
        const uid = JSON.parse(res).uid;

        this.getUser(token, uid).then(usuario => {
          const payload = { usuario, token }
          this.store.dispatch(new Auth.SetAuthenticated(payload))
        });

      } else {
        this.store.dispatch(new Auth.SetUnauthenticated())
      }

      this.storage_counter = 0;

    }).catch(() => {

      this.storage_counter++;

      if (this.storage_counter <= 3) {
        setTimeout(() => {
          this.getNativeStorage();
        }, 200);
      } else {
        this.storage_counter = 0;
      }
    })
  }

  loadStorage() {
    if (this.platform.is('cordova')) {
      this.getNativeStorage();
    } else {
      if (localStorage.getItem('authData')) {

        const res = localStorage.getItem('authData');
        const token = JSON.parse(res).token;
        const uid = JSON.parse(res).uid;

        this.getUser(token, uid).then(usuario => {
          const payload = { usuario, token }
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
    const url = `${this._config.apiURL}/usuarios/update?id=${this.usuario._id}`;
    const headers = new HttpHeaders({ token: this.token, version: this._config.version });
    return this.http.put(url, body, { headers }).toPromise();
  }

  refreshUser() {
    return new Promise((resolve, reject) => {
      const url = `${this._config.apiURL}/usuarios/get-one?id=${this.usuario._id}`;
      const headers = new HttpHeaders({ token: this.token, version: this._config.version });
      this.http.get(url, { headers }).toPromise().then(usuario => {
        this.usuario = usuario;
        resolve(usuario);
      });
    });
  }

  updatePassword(body) {
    const url = `${this._config.apiURL}/usuarios/update-password?id=${this.usuario._id}`;
    const headers = new HttpHeaders({ token: this.token, version: this._config.version });
    return this.http.put(url, body, { headers }).toPromise();
  }

}