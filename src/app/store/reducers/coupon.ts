import {
    CouponActions,
    ADD_COUPON,
    USE_COUPON
} from '../actions/coupon';

export interface State {
    ok: boolean;
    couponId: string;
    coupon: any;
}

const initialState = {
    ok: false,
    couponId: null,
    coupon: null
}

export function authReducer(state = initialState, action: CouponActions) {
    switch (action.type) {
        case ADD_COUPON:            
            return {
                ok: true,
                couponId: action.payload.couponId,
                cuopon: action.payload.coupon
            }
        case USE_COUPON:
            return initialState;

        default:
            return state;
    }
}

export const getCouponState = (state: State) => state;