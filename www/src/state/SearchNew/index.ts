import createReducer from 'state/createReducer';
import {
  clearSearchQueryId,
  setSearchFilter,
  setSearchQuery,
  setSearchQueryId,
} from './reducers';
import { LOCATION_CHANGE } from 'state/Routing/constants';
import {
  SET_SEARCH_FILTER,
  SET_SEARCH_QUERY,
  SET_SEARCH_QUERY_ID,
} from './constants';
import { State } from './types';

export const initialState = {
  searchFilter: '',
  searchQuery: '',
};

const reducer = createReducer<State>(initialState, {
  [SET_SEARCH_FILTER]: setSearchFilter,
  [SET_SEARCH_QUERY]: setSearchQuery,
  [SET_SEARCH_QUERY_ID]: setSearchQueryId,
  [LOCATION_CHANGE]: clearSearchQueryId,
});

export default reducer;
