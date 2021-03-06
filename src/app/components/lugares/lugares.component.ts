import { Component, OnInit, NgZone, OnDestroy } from '@angular/core';
import { DataService } from 'src/app/services/data.service';
import { NavParams, ModalController } from '@ionic/angular';
import { AuthService } from 'src/app/services/auth.service';
import { ControlService } from 'src/app/services/control.service';
declare var google: any;

@Component({
  selector: 'app-lugares',
  templateUrl: './lugares.component.html',
  styleUrls: ['./lugares.component.scss'],
})
export class LugaresComponent implements OnInit {
  GoogleAutocomplete: any;
  autocomplete: any;
  autocompleteItems = [];
  geocoder: any;

  position: any = { ok: false };
  tipo: string;
  accion: string;
  id: string;
  puerta: string;

  isLoading = false;
  timer: any;
  google_flag = true;

  constructor(
    private _data: DataService,
    private zone: NgZone,
    public modalCtrl: ModalController,
    private _auth: AuthService,
    private _control: ControlService
  ) {
    this.tipo = this._control.mis_lugares.tipo;
    this.accion = this._control.mis_lugares.accion;
    this.id = this._control.mis_lugares.id;

    this.GoogleAutocomplete = new google.maps.places.AutocompleteService();
    this.autocomplete = { input: '' };
    this.autocompleteItems = [];
    this.geocoder = new google.maps.Geocoder();
  }

  ngOnInit() { }

  ngOnDestroy() {
    if (this.timer) {
      clearTimeout(this.timer);
    }
  }

  updateSearchResults() {

    if (!this.google_flag) {
      return;
    }

    this.google_flag = false;

    this.timer = setTimeout(() => {
      this.google_flag = true;
    }, 1500);

    if (this.autocomplete.input == '') {
      this.autocompleteItems = [];
      return;
    }
    this.GoogleAutocomplete.getPlacePredictions({ input: this.autocomplete.input, componentRestrictions: { country: 'cl' } },
      (predictions, status) => {
        this.autocompleteItems = [];
        this.zone.run(() => {
          predictions.forEach((prediction) => {
            this.autocompleteItems.push(prediction);
          });
        });
      });
  }

  selectSearchResult(item) {
    this.autocompleteItems = [];
    this.autocomplete.input = item.description;

    this.geocoder.geocode({ 'placeId': item.place_id }, (results, status) => {
      if (status === 'OK' && results[0]) {
        this.position = {
          ok: true,
          address: item.description,
          coors: {
            lat: results[0].geometry.location.lat(),
            lng: results[0].geometry.location.lng()
          }
        };
      } else {
        this.position = {
          ok: false
        };
      }
    });
  }

  close() {
    this.modalCtrl.dismiss({ ok: false });
  }

  save() {
    if (this.position.ok) {

      const body: any = {};
      body.usuario = this._auth.user._id;

      body[this.tipo] = {
        configurado: true,
        direccion: this.position.address,
        lat: this.position.coors.lat,
        lng: this.position.coors.lng,
        puerta: this.puerta
      };

      this.isLoading = true;

      if (this.accion == 'crear') {
        this._data.guardarUbicacion(body).then((data: any) => {
          this.isLoading = false;
          this.modalCtrl.dismiss({ ok: true, tipo: this.tipo, ubicacion: data.ubicacion });
        });
      } else {
        this._data.editarUbicacion(this.id, body).then((data: any) => {
          this.isLoading = false;
          this.modalCtrl.dismiss({ ok: true, tipo: this.tipo, ubicacion: data.ubicacion });
        });
      }

    } else {
      this.modalCtrl.dismiss({ ok: false });
    }
  }

}
