import { get, merge, set } from 'lodash-es';
import { State } from './types';

export function locationChange(
  state: State,
  { history, location, params }: State,
): State {
  return {
    ...state,
    history,
    internalNavCount: get(state, 'internalNavCount', -1) + 1,
    location,
    params,
    previousLocation: get(state, 'location') || location,
  };
}

export function navigate(state: State, { location }: State): State {
  return location ?
      merge({}, state, { location: { pathname: location.pathname } })
    : state;
}

export function resetServerErrors(state: State): State {
  return {
    ...state,
    serverError: {},
  };
}

export function setServerError(state: State, payload: State): State {
  return set(merge({}, state), 'serverError', payload);
}

export function setForce404data(state: State, payload: State): State {
  return {
    ...state,
    ...payload,
  };
}

export function setPageInfo(state: State, pageInfo: State['pageInfo']): State {
  return {
    ...state,
    pageInfo,
  };
}
