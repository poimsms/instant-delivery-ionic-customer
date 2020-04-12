import {
    AuthActions,
    SET_AUTHENTICATED,
    SET_UNAUTHENTICATED
} from '../actions/auth';

export interface State {
    isAuth: boolean;
    usuario: object;
    token: string;
}

const initialState = {
    isAuth: false,
    usuario: null,
    token: null
}

export function authReducer(state = initialState, action: AuthActions) {
    switch (action.type) {
        case SET_AUTHENTICATED:
            
            return {
                isAuth: true,
                usuario: action.payload.usuario,
                token: action.payload.token
            }

        case SET_UNAUTHENTICATED:
            return initialState;

        default:
            return state;
    }
}

export const getIsAuth = (state: State) => state.isAuth;
export const getUsuario = (state: State) => state.usuario;
export const getAuthState = (state: State) => state;