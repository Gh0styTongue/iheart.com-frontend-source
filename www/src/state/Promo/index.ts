import createReducer from 'state/createReducer';
import { PROMOS_LOADED } from './constants';
import { promosLoaded } from './reducers';
import { State } from './types';

export const initialState = {};

const promo = createReducer<State>(initialState, {
  [PROMOS_LOADED]: promosLoaded,
});

export default promo;
