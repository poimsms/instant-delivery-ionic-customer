import { Action } from '@ngrx/store'

export const SET_UP_TRIP = '[Trip] SET_UP_TRIP'
export const SET_VEHICLE = '[Trip] SET_VEHICLE'
export const SET_PAYMENT_METHOD = '[Trip] SET_PAYMENT_METHOD'
export const START_TRIP = '[Trip] START_TRIP'
export const UPDATE_TRIP_STEP = '[Trip] UPDATE_TRIP_STEP'
export const SHOW_TRIP_OPTIONS = '[Trip] SHOW_TRIP_OPTIONS'
export const CANCEL_TRIP = '[Trip] CANCEL_TRIP'


export class ShowTripOptions implements Action {
    readonly type = SHOW_TRIP_OPTIONS
}

export class CancelTrip implements Action {
    readonly type = CANCEL_TRIP
}

export class SetPaymentMethod implements Action {
    readonly type = SET_PAYMENT_METHOD
    constructor(public payload) { }
}

export class UpdateTripStep implements Action {
    readonly type = UPDATE_TRIP_STEP
    constructor(public payload) { }
}

export class StartTrip implements Action {
    readonly type = START_TRIP
    constructor(public payload) { }
}

export class SetUpTrip implements Action {
    readonly type = SET_UP_TRIP
    constructor(public payload) { }
}

export class SetVehicle implements Action {
    readonly type = SET_VEHICLE
    constructor(public payload) { }
}

export type MapActions =
    UpdateTripStep |
    ShowTripOptions |
    SetPaymentMethod |
    CancelTrip |
    StartTrip |
    SetUpTrip |
    SetVehicle;