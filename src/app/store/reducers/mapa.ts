import {
    MapActions,
    SET_ACTIVE_GPS,
    DISPLAY_ROUTE,
    SET_DESTINATION,
    SET_ORIGIN,
    CLEAR_MAP
} from '../actions/map';

export interface State {
    isActiveGPS: boolean;
    displayRoute: boolean;
    clearMap: boolean;
    destination: {
        ok: boolean,
        lat: Number,
        lng: Number,
        address: String
    };
    origin: {
        ok: boolean,
        lat: Number,
        lng: Number,
        address: String
    };
}

const initialState = {
    isActiveGPS: false,
    displayRoute: false,
    clearMap: false,
    destination: {
        ok: false, lat: null, lng: null, address: null
    },
    origin: {
        ok: false, lat: null, lng: null, address: null
    }
}

export function authReducer(state: State = initialState, action: MapActions) {
    switch (action.type) {
        case SET_ORIGIN:
            return {
                ...state,
                origin: action.payload
            }
        case SET_DESTINATION:
            return {
                ...state,
                destination: action.payload
            }
        case DISPLAY_ROUTE:
            return {
                ...state,
                displayRoute: true
            }
        case SET_ACTIVE_GPS:
            return {
                ...state,
                isActiveGPS: true
            }
        case CLEAR_MAP:
            return {
                ...state,
                displayRoute: false,
                clearMap: true,
                origin: { ok: false, lat: null, lng: null, address: null },
                destination: { ok: false, lat: null, lng: null, address: null }
            }
        default:
            return state;
    }
}

// export const getIsAuth = (state: State) => state.isAuth;
// export const getUsuario = (state: State) => state.usuario;
export const getMapState = (state: State) => state;