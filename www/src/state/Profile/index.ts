import createReducer from 'state/createReducer';
import {
  LINK_IOS_TO_ALEXA,
  RECEIVE_PROFILE,
  REJECT_PROFILE,
  REQUEST_PROFILE,
  REQUEST_RECURLY_HISTORY,
  SAVE_IS_UNDERAGE,
  SAVE_PREFERENCE,
  SAVE_PROPERTY,
  TOGGLE_PII_BLOCKING,
} from './constants';
import {
  linkIOSToAlexa,
  receiveProfile,
  rejectProfile,
  requestProfile,
  requestRecurlyBillingHistory,
  saveIsUnderage,
  savePreference,
  saveProperty,
  togglePIIBlocking,
} from './reducers';
import { State } from './types';

export const initialState: State = {
  accountType: null,
  billingHistory: null,
  birthDate: null,
  birthYear: null,
  email: null,
  emailOptOut: null,
  error: null,
  facebookId: null,
  favorites: null,
  firstError: null,
  gender: null,
  googlePlusId: null,
  iheartId: null,
  marketName: null,
  name: null,
  piiBlockingTypes: [],
  preferences: {},
  profileReceived: false,
  roaming: null,
  shareProfile: null,
  zipCode: null,
};

const reducer = createReducer<State>(initialState, {
  [RECEIVE_PROFILE]: receiveProfile,
  [REJECT_PROFILE]: rejectProfile,
  [REQUEST_PROFILE]: requestProfile,
  [REQUEST_RECURLY_HISTORY]: requestRecurlyBillingHistory,
  [SAVE_IS_UNDERAGE]: saveIsUnderage,
  [SAVE_PREFERENCE]: savePreference,
  [SAVE_PROPERTY]: saveProperty,
  [TOGGLE_PII_BLOCKING]: togglePIIBlocking,
  [LINK_IOS_TO_ALEXA]: linkIOSToAlexa,
});

export default reducer;
