import { Action } from '@ngrx/store'

import { AuthData } from '../../models/Auth'

export const USE_COUPON = '[Coupon] Use Coupon'
export const ADD_COUPON = '[Coupon] Add Coupon'

export class AddCoupon implements Action {
    readonly type = ADD_COUPON
    constructor(public payload) { }
}

export class useCoupon implements Action {
    readonly type = USE_COUPON
}

export type CouponActions = useCoupon | AddCoupon;