import { createAction, props } from '@ngrx/store';
import { AuthData } from '../../models/Auth';

export const loadAuthData = createAction(
    '[Auth] Load Auth Data'
);

export const loadStorage = createAction(
    '[Auth] Load Storage'
);

export const logout = createAction(
    '[Auth] Logout'
);

export const setAuthenticated = createAction(
    '[Auth] Set Unauthenticated',
    props<{ payload: any }>()
);

export const setUnauthenticated = createAction(
    '[Auth] Set Unauthenticated'
);

export const updateUser = createAction(
    '[Auth] Load Auth Data'
);

export const updateUserSuccess = createAction(
    '[Auth] Load AuthData Success',
    props<{ payload: AuthData }>()
);

export const updateUserError = createAction(
    '[Auth] Load AuthData Error',
    props<{ payload: any }>()
);
