import createReducer from 'state/createReducer';
import { State } from './types';

export const initialState = {
  facebook: {
    appId: null,
    enabled: null,
    name: null,
    pages: null,
    threshold: null,
  },
  fbAppId: null,
  fbPages: {
    enabled: null,
    name: null,
  },
  google: {
    enabled: null,
    name: null,
  },
  googlePlus: {
    appKey: null,
    name: null,
    threshold: null,
  },
  instagram: {
    enabled: null,
    name: null,
  },
  tiktok: {
    enabled: null,
    name: null,
  },
  tumblr: {
    enabled: null,
    name: null,
  },
  twitter: {
    enabled: null,
    name: null,
  },
  youtube: {
    enabled: null,
    name: null,
  },
};

const reducer = createReducer<State>(initialState, {});

export default reducer;
