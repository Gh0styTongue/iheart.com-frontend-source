import { merge } from 'lodash-es';
import { State } from './types';

export function setEnvironmentVars(state: State, payload: State) {
  return merge({}, state, payload);
}
