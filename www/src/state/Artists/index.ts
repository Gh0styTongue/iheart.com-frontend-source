import createReducer from 'state/createReducer';
import { ARTICLE_LOADED } from 'state/News/constants';
import {
  articleLoaded,
  receiveAdGenre,
  receiveAllStationTypes,
  receiveArtists,
  receiveProfile,
  receiveSimilars,
  removeStation,
  saveStation,
  setIsFavorite,
  setLastPlayedDate,
  updateThumbs,
} from './reducers';
import {
  RECEIVE_AD_GENRE,
  RECEIVE_ARTISTS,
  RECEIVE_PROFILE,
  RECEIVE_SIMILARS,
  SET_IS_FAVORITE,
} from './constants';
import {
  RECEIVE_STATIONS as RECEIVE_ALL_STATION_TYPES,
  REMOVE_STATION,
  SAVE_STATION,
  SET_LAST_PLAYED_DATE,
  UPDATE_THUMBS,
} from 'state/Stations/constants';
import { State } from './types';

export const initialState = { artists: {} };

const reducer = createReducer<State>(initialState, {
  [ARTICLE_LOADED]: articleLoaded,
  [RECEIVE_AD_GENRE]: receiveAdGenre,
  [RECEIVE_ALL_STATION_TYPES]: receiveAllStationTypes,
  [RECEIVE_ARTISTS]: receiveArtists,
  [RECEIVE_PROFILE]: receiveProfile,
  [RECEIVE_SIMILARS]: receiveSimilars,
  [REMOVE_STATION]: removeStation,
  [SAVE_STATION]: saveStation,
  [SET_IS_FAVORITE]: setIsFavorite,
  [SET_LAST_PLAYED_DATE]: setLastPlayedDate,
  [UPDATE_THUMBS]: updateThumbs,
});

export default reducer;
