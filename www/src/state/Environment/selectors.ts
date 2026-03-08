import { createSelector } from 'reselect';
import { get } from 'lodash-es';
import { State as RootState } from 'state/types';
import { State } from './types';

export const getEnvironment = createSelector<RootState, RootState, State>(
  state => state,
  state => get(state, 'environment', {}) as State,
);

export function makeEnvironmentSelector<K extends keyof State, F = State[K]>(
  attr: K,
  fallback?: F,
) {
  return createSelector<RootState, State, State[K] | F>(
    getEnvironment,
    environment => get(environment, attr, fallback) as State[K] | F,
  );
}

export const getIsInApp = makeEnvironmentSelector('isInApp');

export const getIsBot = makeEnvironmentSelector('isBot');

export const getIsMobile = (state: RootState) =>
  state.environment.isMobile ?? false;

// the isSDK value isn't currently set anywhere, so this code won't be run until we're further along in the rewrite of that service
export const getIsSDK = makeEnvironmentSelector('isSDK');

export const getEnv = makeEnvironmentSelector('env');

export const getVersion = makeEnvironmentSelector('version');
