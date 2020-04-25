import { Injectable } from '@angular/core';
import { CanActivate } from '@angular/router';
import { Store } from '@ngrx/store';
import * as fromRoot from '../app.reducers'
@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  isAuth: boolean;

  constructor(private store: Store<fromRoot.State>) {

    this.store.select(fromRoot.getIsAuth)
      .subscribe(isAuth => this.isAuth = isAuth)
  }
  
  canActivate() {
    return this.isAuth;
  }

}
