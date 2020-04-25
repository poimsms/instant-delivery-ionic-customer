import { Action } from '@ngrx/store'

export const DISPLAY_ROUTE = '[Map] DISPLAY_ROUTE';
export const INIT_MAP = '[Map] INIT_MAP';
export const SET_DESTINATION = '[Map] SET_DESTINATION';
export const SET_ORIGIN = '[Map] SET_ORIGIN';
export const SET_ACTIVE_GPS = '[Map] SET_ACTIVE_GPS';

export class DisplayRoute implements Action {
    readonly type = DISPLAY_ROUTE
}

export class InitMap implements Action {
    readonly type = INIT_MAP
}

export class SetDestination implements Action {
    readonly type = SET_DESTINATION
    constructor(public payload) { }
}

export class SetOrigin implements Action {
    readonly type = SET_ORIGIN
    constructor(public payload) { }
}

export class SetActiveGPS implements Action {
    readonly type = SET_ACTIVE_GPS
}

export type MapActions = DisplayRoute | InitMap | SetDestination | SetOrigin | SetActiveGPS;