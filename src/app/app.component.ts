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
import { ControlService } from './services/control.service';
import { Store } from '@ngrx/store';
import * as fromAuth from './store/reducers/auth';
import { Observable } from 'rxjs';
import { take } from 'rxjs/operators';

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
    private _fcm: FcmService,
    private _config: ConfigService,
    public alertController: AlertController,
    private _control: ControlService,
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

        setTimeout(() => this._auth.loadStorage(), 500);

        if (data.forceUpgrade) {

          this.openForceModal();

        } else if (data.recommendUpgrade) {

          this.openForceModal();

        } else {

          this.store.select(fromAuth.getAuthState).subscribe(state => {

            if (state.isAuth) {

              this.usuario = state.user;

              this._fcm.getToken(this.usuario._id);
              this._fcm.onTokenRefresh(this.usuario._id);

              if (!data.usuario.isActive) {

                this.openBloqueadoModal();

              } else {

                this.router.navigateByUrl('home');
              }

            } else {
              this.router.navigateByUrl('login');
            }
          })
        }
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
    this._auth.logout();
    this.menu.toggle();
    this.router.navigateByUrl('login');
  }
}
