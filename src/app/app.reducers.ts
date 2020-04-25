import {ActionReducerMap, createFeatureSelector, createSelector} from '@ngrx/store';

import * as fromAuth from './store/reducers/auth';


export interface State {
    auth: fromAuth.State 
}

export const reducers: ActionReducerMap <State> = {
    auth: fromAuth.authReducer
}

export const authFeature = createFeatureSelector<fromAuth.State>('auth')
export const getIsAuth = createSelector(authFeature, fromAuth.getIsAuth)

