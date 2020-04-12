import { Action } from '@ngrx/store'

import { AuthData } from '../../models/Auth'

export const SET_DESTINATION = '[Coupon] Use Coupon'
export const SET_ORIGIN = '[Coupon] Add Coupon'

export class useCoupon implements Action {
    readonly type = SET_DESTINATION
    constructor(public payload: AuthData) { }
}

export class AddCoupon implements Action {
    readonly type = SET_ORIGIN
}

export type AuthActions = useCoupon | AddCoupon;