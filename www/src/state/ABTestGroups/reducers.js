import { get, merge } from 'lodash-es';

export const initialState = {};

export function queryForABTestGroup(state, payload) {
  return merge({}, state, get(payload, 'groups', {}));
}
