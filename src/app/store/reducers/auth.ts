import { createReducer, on } from '@ngrx/store';

import {
    loadAuthData,
    loadStorage,
    logout,
    updateUser,
    updateUserSuccess,
    updateUserError,
    setAuthenticated,
    setUnauthenticated,
} from '../actions/auth';

export interface State {
    isAuth: boolean;
    loading: boolean;
    userUpdate: boolean;
    user: any;
    token: string;
}

const initialState: State = {
    isAuth: false,
    loading: false,
    userUpdate: false,
    user: null,
    token: null
}

const _userReducer = createReducer(initialState,

    on(loadStorage, state => state),

    on(loadAuthData, state => ({ ...state, loading: true })),

    on(setAuthenticated, (state, { payload }) => ({
        ...state,
        loading: false,
        isAuth: true,
        user: payload.user,
        token: payload.token
    })),

    on(setUnauthenticated, state => initialState),

    on(logout, state => ({ ...state, loading: true }))
);


export function userReducer(state, action) {
    return _userReducer(state, action);
}


export const getIsAuth = (state: State) => state.isAuth;
export const getUser = (state: State) => state.user;
export const getAuthState = (state: State) => state;