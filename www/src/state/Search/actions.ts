import { SET_SEARCH_FILTER, SET_SEARCH_QUERY } from './constants';
import type { State } from './types';

export function setSearchQuery({ query }: { query: State['searchQuery'] }) {
  return {
    payload: { query },
    type: SET_SEARCH_QUERY,
  };
}

export function setSearchFilter({ filter }: { filter: State['searchFilter'] }) {
  return {
    payload: { filter },
    type: SET_SEARCH_FILTER,
  };
}
