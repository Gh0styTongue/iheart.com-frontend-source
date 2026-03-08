import createReducer from 'state/createReducer';
import {
  LOCATION_CHANGE,
  NAVIGATE,
  RESET_SERVER_ERRORS,
  SET_FORCE_404_DATA,
  SET_PAGE_INFO,
  SET_SERVER_ERROR,
} from './constants';
import {
  locationChange,
  navigate,
  resetServerErrors,
  setForce404data,
  setPageInfo,
  setServerError,
} from './reducers';
import { State } from './types';

export const initialState = {
  force404data: null,
  history: {
    action: null,
    length: null,
    location: {
      hash: null,
      key: null,
      pathname: null,
      search: null,
    },
  },
  internalNavCount: -1, // gets incremented on the first page load
  location: {
    hash: null,
    key: null,
    pathname: null,
    search: '',
  },
  params: {},
  previousLocation: {
    hash: null,
    key: null,
    pathname: null,
    search: null,
  },
  serverError: {},
  pageInfo: {},
};

const reducer = createReducer<State>(initialState, {
  [LOCATION_CHANGE]: locationChange,
  [NAVIGATE]: navigate,
  [RESET_SERVER_ERRORS]: resetServerErrors,
  [SET_FORCE_404_DATA]: setForce404data,
  [SET_SERVER_ERROR]: setServerError,
  [SET_PAGE_INFO]: setPageInfo,
});

export default reducer;
