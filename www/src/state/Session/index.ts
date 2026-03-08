import createReducer from 'state/createReducer';
import {
  CLEAR_SESSION_ERROR,
  LOGOUT,
  RECEIVE_ANONYMOUS_SESSION,
  RECEIVE_SESSION,
  REJECT_SESSION,
  REQUEST_SESSION,
  SESSION_EXPIRED,
  SESSION_REFRESHED,
  SET_DEVICE_ID,
  SOCIAL_AUTH,
} from './constants';
import {
  clearSessionError,
  logout,
  receiveAnonymousSession,
  receiveSession,
  rejectSession,
  requestSession,
  sessionExpired,
  sessionRefreshed,
  setDeviceId,
} from './reducers';
import { State } from './types';

export const initialState = {
  anonId: null,
  deviceId: null,
  errorMessage: null,
  genreSelected: false,
  isAnonymous: false,
  isAuthenticated: false,
  isRequestingSession: false,
  profileId: null,
  sessionExpired: false,
  sessionId: null,
};

const reducer = createReducer<State>(initialState, {
  [CLEAR_SESSION_ERROR]: clearSessionError,
  [LOGOUT]: logout,
  [RECEIVE_ANONYMOUS_SESSION]: receiveAnonymousSession,
  [RECEIVE_SESSION]: receiveSession,
  [REJECT_SESSION]: rejectSession,
  [REQUEST_SESSION]: requestSession,
  [SESSION_EXPIRED]: sessionExpired,
  [SESSION_REFRESHED]: sessionRefreshed,
  [SET_DEVICE_ID]: setDeviceId,
  [SOCIAL_AUTH]: receiveSession,
});

export default reducer;
