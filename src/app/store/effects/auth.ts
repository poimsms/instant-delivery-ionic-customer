import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import * as authActions from '../actions/auth';
import { tap, map, mergeMap } from 'rxjs/operators';
import { AuthService } from 'src/app/services/auth.service';
import { TripService } from 'src/app/services/trip.service';
import { FcmService } from 'src/app/services/fcm.service';
import { Router } from '@angular/router';

@Injectable()
export class AuthEffects {

    constructor(
        private actions$: Actions,
        private _auth: AuthService,
        private _trip: TripService,
        private _fcm: FcmService,
        private router: Router
    ) { }


    loadAuthData$ = createEffect((): any =>
        this.actions$.pipe(

            ofType(authActions.loadAuthData),
            mergeMap(
                () => this._auth.authData$.pipe(
                    map((data: any) => {

                        if (!data.isAuth) {
                            this.router.navigateByUrl('login')
                            return authActions.setUnauthenticated()
                        }

                        this._trip.loadCoupon()
                        this._trip.loadRate()
                        this._trip.loadRider()
                        this._trip.loadTrip()

                        this._fcm.getToken(data.user._id)
                        this._fcm.onTokenRefresh(data.user._id)

                        this.router.navigateByUrl('home')

                        authActions.setAuthenticated(data)
                    })
                )

            )
        ));


    loadStorage$ = createEffect((): any => this.actions$.pipe(
        ofType(authActions.loadStorage),
        tap(() => this._auth.loadStorage())
    ),
        { dispatch: false }
    );


    logout$ = createEffect((): any => this.actions$.pipe(
        ofType(authActions.logout),
        map(() => {
            this._auth.removeStorage();
            this.router.navigateByUrl('login');
            return authActions.setUnauthenticated()
        })
    ));
}