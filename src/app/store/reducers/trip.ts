import Trip from '../../models/trip';
import initialState from '../../models/init';
import STATUS from '../../utils/trip-status';

import {
    MapActions,
    SET_UP_TRIP,
    SET_VEHICLE,
    SET_PAYMENT_METHOD,
    START_TRIP,
    UPDATE_TRIP_STEP,
    SHOW_TRIP_OPTIONS,
    INIT_TRIP
} from '../actions/trip';


export function authReducer(state: Trip = initialState, action: MapActions) {
    switch (action.type) {
        case SET_UP_TRIP:
            return {
                ...state,
                status: STATUS.IN_SETUP,
                origin: action.payload.origin,
                destination: action.payload.destination,
                prices: action.payload.prices,
                times: action.payload.times,
                distance: action.payload.distance
            }

        case SET_VEHICLE:
            return {
                ...state,
                vehicle: action.payload.vehicle
            }
        case SET_PAYMENT_METHOD:
            return {
                ...state,
                payment_method: action.payload.payment_method
            }
        case START_TRIP:
            return {
                ...state,
                status: STATUS.IN_PROGRESS,
                origin: action.payload.origin,
                destination: action.payload.destination,
                price: action.payload.prices,
                time: action.payload.times,
                distance: action.payload.distance,
                step: action.payload.step,
                payment_method: action.payload.payment_method,
                vehicle: action.payload.vehicle
            }

        case UPDATE_TRIP_STEP:
            return {
                ...state,
                step: action.payload.step
            }

        case SHOW_TRIP_OPTIONS:
            return {
                ...state,
                showOptions: !state.showOptions
            }

        case INIT_TRIP:
            return {
                initialState
            }

        default:
            return state;
    }
}

// export const getIsAuth = (state: State) => state.isAuth;
// export const getUsuario = (state: State) => state.usuario;
export const getMapState = (state: Trip) => state;