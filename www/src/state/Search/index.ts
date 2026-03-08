import createReducer from 'state/createReducer';
import { SET_SEARCH_FILTER, SET_SEARCH_QUERY } from './constants';
import { setSearchFilter, setSearchQuery } from './reducers';
import { State } from './types';

export const initialState = {
  searchFilter: '',
  searchQuery: '',
};

const reducer = createReducer<State>(initialState, {
  [SET_SEARCH_FILTER]: setSearchFilter,
  [SET_SEARCH_QUERY]: setSearchQuery,
});

export default reducer;
