import { merge } from 'lodash-es';
import { pathIsChildOrParent } from './helpers';

import type { Location } from 'state/Routing/types';
import type { State } from './types';

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

export function setSearchQueryId(
  state: State,
  { queryId, scope }: { queryId: string; scope: string },
): State {
  return merge({}, state, { queryId, queryIdScope: scope });
}

export function clearSearchQueryId(
  state: State,
  { location }: { location: Location },
): State {
  const { queryIdScope = '', queryId: _queryId, ...otherState } = state;
  const { pathname = '' } = location;

  if (
    queryIdScope &&
    pathname &&
    pathname !== '/' &&
    pathIsChildOrParent(pathname, queryIdScope)
  ) {
    return state;
  }
  return otherState;
}
