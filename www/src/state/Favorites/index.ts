import createReducer from 'state/createReducer';
import {
  RECEIVE_STATIONS as RECEIVE_ALL_STATION_TYPES,
  RECEIVE_LISTEN_HISTORY,
  SAVE_STATION,
  UPDATE_THUMBS,
} from 'state/Stations/constants';
import { RECEIVE_SESSION } from 'state/Session/constants';
import {
  receiveAllStationTypes,
  receiveListenHistory,
  receiveSession,
  saveStation,
  setHasMFR,
  setListenHistory,
  setMyFavoriteRadio,
  setMyFavoriteRadioName,
  updateThumbs,
} from './reducers';
import {
  SET_HAS_MFR,
  SET_LISTEN_HISTORY,
  SET_MY_FAVORITE_RADIO,
  SET_MY_FAVORITE_RADIO_NAME,
} from 'state/Favorites/constants';
import { State } from './types';

const reducer = createReducer<State>(
  {},
  {
    [RECEIVE_ALL_STATION_TYPES]: receiveAllStationTypes,
    [RECEIVE_LISTEN_HISTORY]: receiveListenHistory,
    [RECEIVE_SESSION]: receiveSession,
    [SAVE_STATION]: saveStation,
    [SET_HAS_MFR]: setHasMFR,
    [SET_MY_FAVORITE_RADIO]: setMyFavoriteRadio,
    [SET_MY_FAVORITE_RADIO_NAME]: setMyFavoriteRadioName,
    [SET_LISTEN_HISTORY]: setListenHistory,
    [UPDATE_THUMBS]: updateThumbs,
  },
);

export default reducer;
