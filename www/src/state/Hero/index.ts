import createReducer from 'state/createReducer';
import {
  RESET,
  SET_BACKGROUND,
  SET_HAS_HERO,
  SET_HIDE_HERO,
  SET_HOME_HERO,
  SET_PREMIUM_BACKGROUND,
  SET_TITLE,
} from './constants';
import {
  reset,
  setBackground,
  setHasHero,
  setHideHero,
  setHomeHero,
  setPremiumBackground,
  setREProfileData,
  setTitle,
  initialState as state,
} from './reducers';
import { SET_RE_PROFILE_DATA } from 'state/Live/constants';
import { State } from './types';

export const initialState = state;

export const reducer = createReducer<State>(initialState, {
  [RESET]: reset,
  [SET_BACKGROUND]: setBackground,
  [SET_HAS_HERO]: setHasHero,
  [SET_HIDE_HERO]: setHideHero,
  [SET_HOME_HERO]: setHomeHero,
  [SET_PREMIUM_BACKGROUND]: setPremiumBackground,
  [SET_RE_PROFILE_DATA]: setREProfileData,
  [SET_TITLE]: setTitle,
});

export default reducer;
