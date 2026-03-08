import createReducer from 'state/createReducer';
import {
  RECEIVE_CURRENT_LOCATION,
  RECEIVE_CURRENT_MARKET,
  RECEIVE_DEFAULT_MARKET,
} from './constants';
import {
  receiveCurrentLocation,
  receiveCurrentMarket,
  receiveDefaultMarket,
} from './reducers';

export const initialState = {
  currentLocation: undefined,
  currentMarket: undefined,
  defaultMarket: undefined,
};

const reducer = createReducer(initialState, {
  [RECEIVE_CURRENT_LOCATION]: receiveCurrentLocation,
  [RECEIVE_CURRENT_MARKET]: receiveCurrentMarket,
  [RECEIVE_DEFAULT_MARKET]: receiveDefaultMarket,
});

export default reducer;
