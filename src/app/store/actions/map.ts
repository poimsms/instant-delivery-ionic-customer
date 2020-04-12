import { Action } from '@ngrx/store'

import { AuthData } from '../../models/Auth'

export const DISPLAY_ROUTE = '[Map] Display Route'
export const CLEAR_MAP = '[Map] Clear Map'
export const SET_DESTINATION = '[Map] Set Destination'
export const SET_ORIGIN = '[Map] Set Origin'
export const SET_ACTIVE_GPS = '[Map] Set Active GPS'

export class DisplayRoute implements Action {
    readonly type = DISPLAY_ROUTE
}

export class ClearMap implements Action {
    readonly type = CLEAR_MAP
}

export class SetDestination implements Action {
    readonly type = SET_DESTINATION
    constructor(public payload: AuthData) { }
}

export class SetOrigin implements Action {
    readonly type = SET_ORIGIN
    constructor(public payload: AuthData) { }
}

export class SetActiveGPS implements Action {
    readonly type = SET_ACTIVE_GPS
}

export type MapActions = DisplayRoute | ClearMap | SetDestination | SetOrigin | SetActiveGPS;