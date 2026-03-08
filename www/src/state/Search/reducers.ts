import { merge } from 'lodash-es';
import { State } from './types';

export function setSearchQuery(
  state: State,
  {
    query,
  }: {
    query: string;
  },
): State {
  return merge({}, state, { searchQuery: query });
}

export function setSearchFilter(
  state: State,
  {
    filter,
  }: {
    filter: string;
  },
): State {
  return merge({}, state, { searchFilter: filter });
}
