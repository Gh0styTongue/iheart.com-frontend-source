import { createSelector } from 'reselect';

import type { Selector } from 'state/types';
import type { State } from './types';

export const getSearch: Selector<State> = createSelector(
  state => state,
  state => state?.searchNew ?? {},
);

export const getSearchQuery: Selector<string> = createSelector(
  getSearch,
  search => search?.searchQuery ?? '',
);

export const getSearchFilter: Selector<string> = createSelector(
  getSearch,
  search => search?.searchFilter ?? '',
);
