import createReducer from 'state/createReducer';
import { combineReducers } from 'redux';
import { CustomAds, GoogleTag, Triton } from './types';
import {
  NEW_CUSTOM_COMPANION,
  RECEIVE_STATION_TARGETTING,
  RECIEVE_TRITON_SECURE_TOKEN,
  SET_TFCD_AGE_LIMIT,
  SET_TRITON_PARTNER_IDS,
} from './constants';
import {
  newCustomCompanion,
  receiveStationTargettingParams,
  RecieveTritonSecureToken,
  setTFCDAgeLimit,
  setTritonParternIds,
} from './reducers';
import type { StationTargetingInfo } from './types';

export const initialCustomAdsState: CustomAds = {
  companion: null,
  enableCustomAds: false,
  partnerIds: '',
  playing: false,
  tritonPartnerIds: {},
  type: '',
  url: '',
};

const customAds = createReducer(initialCustomAdsState, {
  [NEW_CUSTOM_COMPANION]: newCustomCompanion,
  [SET_TRITON_PARTNER_IDS]: setTritonParternIds,
});

export const initialGoogleTagState: GoogleTag = {
  dfpInstanceId: null,
};

const stationTargetingInfo = createReducer<StationTargetingInfo>(
  {},
  {
    [RECEIVE_STATION_TARGETTING]: receiveStationTargettingParams,
  },
);

const triton = createReducer<Triton>(
  {},
  {
    [RECIEVE_TRITON_SECURE_TOKEN]: RecieveTritonSecureToken,
  },
);

const reducer = combineReducers({
  adInterval: createReducer(0),
  adswizz: createReducer({}),
  amazon: createReducer({}),
  customAds,
  env: createReducer({}),
  googleTag: createReducer({}),
  indexExchange: createReducer({}),
  lotame: createReducer({}),
  rubicon: createReducer({}),
  stationTargetingInfo,
  suppressAds: createReducer(false),
  triton,
  TFCD: createReducer(Infinity, { [SET_TFCD_AGE_LIMIT]: setTFCDAgeLimit }),
  ias: createReducer({}),
});

export default reducer;
