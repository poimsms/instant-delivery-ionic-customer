import { Component } from '@angular/core';
import { Platform, MenuController, ModalController, AlertController } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { Router } from '@angular/router';
import { AuthService } from './services/auth.service';
import { ForceUpgradeComponent } from './components/force-upgrade/force-upgrade.component';
import { BloqueadoComponent } from './components/bloqueado/bloqueado.component';
import { FcmService } from './services/fcm.service';
import { ConfigService } from './services/config.service';
import { Market } from '@ionic-native/market/ngx';
import { Store } from '@ngrx/store';
import { TripService } from './services/trip.service';

import * as fromAuth from './store/reducers/auth';
import * as fromRoot from './app.reducers';


import { loadStorage, logout } from './store/actions/auth';




@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html'
})
export class AppComponent {

  usuario: any;
  isAuth = false;

  constructor(
    private platform: Platform,
    private splashScreen: SplashScreen,
    private statusBar: StatusBar,
    private menu: MenuController,
    private router: Router,
    public _auth: AuthService,
    public modalController: ModalController,
    private _config: ConfigService,
    public alertController: AlertController,
    private store: Store<fromAuth.State>
  ) {
    this.initializeApp();
  }

  initializeApp() {
    this.platform.ready().then(() => {

      this.statusBar.styleDefault();
      this.statusBar.overlaysWebView(false);
      this.splashScreen.hide();

      this._config.checkUpdate().then((data: any) => {

        this.store.dispatch(loadStorage())

        if (data.forceUpgrade) {
          return this.openForceModal();
        }

        this.store.select(fromRoot.getAuthState);
      });
    });
  }


  async openForceModal() {
    const modal = await this.modalController.create({
      component: ForceUpgradeComponent
    });
    await modal.present();
  }

  async openBloqueadoModal() {
    const modal = await this.modalController.create({
      component: BloqueadoComponent
    });
    await modal.present();
  }

  openFirst() {
    this.menu.enable(true, 'first');
    this.menu.open('first');
  }

  openPage(page) {
    this.router.navigateByUrl(page);
    this.menu.toggle();
  }

  logout() {
    this.store.dispatch(logout())
    this.menu.toggle();
  }
}
