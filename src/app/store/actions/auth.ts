import { Action } from '@ngrx/store'

import { AuthData } from '../../models/Auth'

export const SET_AUTHENTICATED = '[Auth] Set Authenticated'
export const SET_UNAUTHENTICATED = '[Auth] Set Unauthenticated'

export class SetAuthenticated implements Action {
    readonly type = SET_AUTHENTICATED
    constructor(public payload: AuthData) { }
}

export class SetUnauthenticated implements Action {
    readonly type = SET_UNAUTHENTICATED
}

export type AuthActions = SetAuthenticated | SetUnauthenticated;