import createReducer from 'state/createReducer';
import {
  APP_MOUNTED,
  HIDE_GROWL,
  HIDE_SIDE_NAV,
  SET_IS_AD_BLOCKED,
  SET_IS_FSP_OPEN,
  SET_IS_LISTEN_IN_APP_VISIBLE,
  SET_MODAL,
  SHOW_GROWL,
  SHOW_SIDE_NAV,
  TOGGLE_ACCOUNT_DROPDOWN,
} from './constants';
import {
  appMounted,
  hideGrowl,
  hideSideNav,
  setIsAdBlocked,
  setIsFSPOpen,
  setIsListenInAppVisible,
  setModal,
  showGrowl,
  showSideNav,
  toggleAccountDropdown,
} from './reducers';
import { State } from './types';

export const initialState = {
  appMounted: false,
  growls: [],
  isAdBlocked: false,
  isFSPOpen: false,
  isListenInAppVisible: false,
  modal: {
    id: null,
    context: null,
  },
  showingAccountDropdown: false,
  showingSideNav: false,
  showingWidgetLoginOverflow: false,
};

const reducer = createReducer<State>(initialState, {
  [APP_MOUNTED]: appMounted,
  [HIDE_SIDE_NAV]: hideSideNav,
  [HIDE_GROWL]: hideGrowl,
  [SET_IS_AD_BLOCKED]: setIsAdBlocked,
  [SET_IS_FSP_OPEN]: setIsFSPOpen,
  [SET_IS_LISTEN_IN_APP_VISIBLE]: setIsListenInAppVisible,
  [SET_MODAL]: setModal,
  [SHOW_GROWL]: showGrowl,
  [SHOW_SIDE_NAV]: showSideNav,
  [TOGGLE_ACCOUNT_DROPDOWN]: toggleAccountDropdown,
});

export default reducer;
