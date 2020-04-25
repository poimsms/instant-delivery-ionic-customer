import {
    MapActions,
    DISPLAY_ROUTE,
    SET_DESTINATION,
    SET_ORIGIN,
    INIT_MAP,
    SET_ACTIVE_GPS
} from '../actions/map';

export interface State {
    displayRoute: boolean;
    initMap: boolean;
    gpsActived: boolean;
    center: {
        lat: Number;
        lng: Number;
    };
    destination: {
        isSet: boolean,
        lat: Number,
        lng: Number,
        address: String
    };
    origin: {
        isSet: boolean,
        lat: Number,
        lng: Number,
        address: String
    };
}

const initialState = {
    displayRoute: false,
    initMap: false,
    gpsActived: false,
    center: null,
    destination: null,
    origin: null
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
        case INIT_MAP:
            return {
                ...initialState,
                clearMap: true
            }
        case SET_ACTIVE_GPS:
            return {
                ...initialState,
                gpsActived: true
            }
        default:
            return state;
    }
}

export const getMapState = (state: State) => state;