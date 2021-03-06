import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { ConfigService } from './config.service';
import { AuthService } from './auth.service';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DataService {

  cuponData = new BehaviorSubject({ ok: false, cupon: null, id: null });

  constructor(
    public http: HttpClient,
    private _config: ConfigService,
    private _auth: AuthService
  ) { }

  rateRider(rateId, riderId, body) {
    const url = `${this._config.apiURL}/core/rating-update?rate=${rateId}&rider=${riderId}`;
    const headers = new HttpHeaders({ token: this._auth.token, version: this._config.version });
    return this.http.put(url, body, { headers }).toPromise();
  }

  getActiveRating(id) {
    const url = `${this._config.apiURL}/core/rating-get-active-one?id=${id}`;
    const headers = new HttpHeaders({ token: this._auth.token, version: this._config.version });
    return this.http.get(url, { headers }).toPromise();
  }

  getOneRider(id) {
    const url = `${this._config.apiURL}/core/usuario-get-one?id=${id}`;
    const headers = new HttpHeaders({ token: this._auth.token, version: this._config.version });
    return this.http.get(url, { headers }).toPromise();
  }

  crearPedido(body) {
    const url = `${this._config.apiURL}/core/pedidos-create`;
    const headers = new HttpHeaders({ token: this._auth.token, version: this._config.version });
    return this.http.post(url, body, { headers }).toPromise();
  }

  getPedidos(id, tipo) {
    const url = `${this._config.apiURL}/core/pedidos-get-by-client-id?id=${id}&tipo=${tipo}`;
    const headers = new HttpHeaders({ token: this._auth.token, version: this._config.version });
    return this.http.get(url, { headers }).toPromise();
  }

  getPedidoActivo(id) {
    const url = `${this._config.apiURL}/core/pedidos-get-active-one?id=${id}`;
    const headers = new HttpHeaders({ token: this._auth.token, version: this._config.version });
    return this.http.get(url, { headers }).toPromise();
  }

  getOnePedido(id) {
    const url = `${this._config.apiURL}/core/pedidos-get-one?id=${id}`;
    const headers = new HttpHeaders({ token: this._auth.token, version: this._config.version });
    return this.http.get(url, { headers }).toPromise();
  }

  getCupones(id) {
    const url = `${this._config.apiURL}/core/cupones-get-all?id=${id}`;
    const headers = new HttpHeaders({ token: this._auth.token, version: this._config.version });
    return this.http.get(url, { headers }).toPromise();
  }

  getActiveCoupon(id) {
    const url = `${this._config.apiURL}/core/cupones-get-active-one?id=${id}`;
    const headers = new HttpHeaders({ token: this._auth.token, version: this._config.version });
    return this.http.get(url, { headers }).toPromise();
  }

  addCupon(body) {
    const url = `${this._config.apiURL}/core/cupones-add-one`;
    const headers = new HttpHeaders({ token: this._auth.token, version: this._config.version });
    return this.http.post(url, body, { headers }).toPromise();
  }

  useCupon(id) {
    const url = `${this._config.apiURL}/core/cupones-use-one?id=${id}`;
    const headers = new HttpHeaders({ token: this._auth.token, version: this._config.version });
    return this.http.get(url, { headers }).toPromise();
  }

  getUbicaciones(id) {
    const url = `${this._config.apiURL}/core/ubicacion-get?id=${id}`;
    const headers = new HttpHeaders({ token: this._auth.token, version: this._config.version });
    return this.http.get(url, { headers }).toPromise();
  }

  guardarUbicacion(body) {
    const url = `${this._config.apiURL}/core/ubicacion-create`;
    const headers = new HttpHeaders({ token: this._auth.token, version: this._config.version });
    return this.http.post(url, body, { headers }).toPromise();
  }

  editarUbicacion(id, body) {
    const url = `${this._config.apiURL}/core/ubicacion-update?id=${id}`;
    const headers = new HttpHeaders({ token: this._auth.token, version: this._config.version });
    return this.http.put(url, body, { headers }).toPromise();
  }

  getNeerestRider(body) {
    const url = `${this._config.apiURL}/core/get-neerest-rider`;
    const headers = new HttpHeaders({ token: this._auth.token, version: this._config.version });
    return this.http.post(url, body, { headers }).toPromise();
  }

  cancelarPedido(body) {
    const url = `${this._config.apiURL}/core/pedido-cancelar`;
    const headers = new HttpHeaders({ token: this._auth.token, version: this._config.version });
    return this.http.put(url, body, { headers }).toPromise();
  }

  createBalance(body) {
    const url = `${this._config.apiURL}/core/balance-empresa-create`;
    const headers = new HttpHeaders({ token: this._auth.token, version: this._config.version });
    return this.http.post(url, body, { headers }).toPromise();
  }

  updatePedido(id, body) {
    const url = `${this._config.apiURL}/core/pedido-update?id=${id}`;
    const headers = new HttpHeaders({ token: this._auth.token, version: this._config.version });
    return this.http.put(url, body, { headers }).toPromise();
  }

  getLocation(id) {
    const url = `${this._config.apiURL}/core/location-get?id=${id}`;
    const headers = new HttpHeaders({ token: this._auth.token, version: this._config.version });
    return this.http.get(url, { headers }).toPromise();
  }

  getPrices(body) {
    const url = `${this._config.apiURL}/core/price-get`;
    const headers = new HttpHeaders({ token: this._auth.token, version: this._config.version });
    return this.http.post(url, body, { headers }).toPromise();
  }

  getActiveTrip(id) {
    const url = `${this._config.apiURL}/core/trip-active-get?id=${id}`;
    const headers = new HttpHeaders({ token: this._auth.token, version: this._config.version });
    return this.http.get(url, { headers }).toPromise();
  }
}

