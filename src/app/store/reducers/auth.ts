import {
    AuthActions,
    SET_AUTHENTICATED,
    SET_UNAUTHENTICATED
} from '../actions/auth';

export interface State {
    isAuth: boolean;
    user: any;
    token: string;
}

const initialState = {
    isAuth: false,
    user: null,
    token: null
}

export function authReducer(state = initialState, action: AuthActions) {
    switch (action.type) {
        case SET_AUTHENTICATED:
            
            return {
                isAuth: true,
                user: action.payload.user,
                token: action.payload.token
            }

        case SET_UNAUTHENTICATED:
            return initialState;

        default:
            return state;
    }
}

export const getIsAuth = (state: State) => state.isAuth;
export const getUser = (state: State) => state.user;
export const getAuthState = (state: State) => state;