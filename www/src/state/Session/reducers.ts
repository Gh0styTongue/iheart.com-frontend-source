import { merge } from 'lodash-es';
import { State } from './types';

export function logout(state: State) {
  return merge({}, state, {
    anonId: null,
    errorMessage: null,
    genreSelected: false,
    isAnonymous: false,
    isAuthenticated: false,
    isRequestingSession: false,
    profileId: null,
    sessionExpired: false,
    sessionId: null,
  });
}

export function requestSession(state: State) {
  return merge({}, state, { isRequestingSession: true });
}

export function receiveAnonymousSession(state: State, payload: State): State {
  return merge({}, state, {
    anonId: payload.anonId,
    errorMessage: null,
    genreSelected: false,
    isAnonymous: true,
    isAuthenticated: true,
    isRequestingSession: false,
    profileId: payload.profileId,
    sessionId: payload.sessionId,
  });
}

export function receiveSession(state: State, payload: State): State {
  return merge({}, state, {
    anonId: null,
    errorMessage: null,
    isAnonymous: false,
    isAuthenticated: true,
    isRequestingSession: false,
    profileId: payload.profileId,
    sessionId: payload.sessionId,
  });
}

export function rejectSession(state: State, payload: State): State {
  return merge({}, state, { errorMessage: payload });
}

export function clearSessionError(state: State): State {
  return merge({}, state, { errorMessage: null });
}

export function sessionExpired(state: State) {
  return merge({}, state, { sessionExpired: true });
}

export function sessionRefreshed(state: State) {
  return merge({}, state, { sessionExpired: false });
}

export function setDeviceId(state: State, deviceId: string) {
  return merge({}, state, { deviceId });
}
