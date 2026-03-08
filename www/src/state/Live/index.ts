import createReducer from 'state/createReducer';
import {
  RECEIVE_STATIONS as RECEIVE_ALL_STATION_TYPES,
  REMOVE_STATION,
  SAVE_STATION,
  SET_LAST_PLAYED_DATE,
  UPDATE_THUMBS,
} from 'state/Stations/constants';
import {
  RECEIVE_LIVE_META_DATA,
  RECEIVE_STATIONS as RECEIVE_LIVE_STATIONS,
  RECEIVE_ONE_STATION,
  RECEIVE_SIMILAR_LIVE_STATIONS,
  REQUEST_STATIONS,
  SET_COUNTRY,
  SET_COUNTRY_OPTIONS,
  SET_GENRE,
  SET_HIGHLIGHTS_METADATA,
  SET_IS_FAVORITE,
  SET_MARKET,
  SET_MARKET_AND_GENRE_OPTIONS,
  SET_RE_PROFILE_DATA,
  SET_RECENTLY_PLAYED,
} from './constants';
import {
  receiveAllStationTypes,
  receiveLiveStations,
  receiveOneStation,
  receiveSimilarLiveStations,
  removeStationFromHistory,
  requestStations,
  saveStation,
  setCountry,
  setCountryOptions,
  setGenre,
  setHighlightsMetadata,
  setIsFavorite,
  setLastPlayedDate,
  setLiveMetaData,
  setMarket,
  setMarketAndGenreOptions,
  setRadioEditProfileData,
  setRecentlyPlayed,
  updateThumbs,
} from './reducers';
import { State } from './types';

export const initialState: State = {
  highlightsMetadata: null,
  countryOptions: [],
  defaults: {},
  filters: {
    country: null,
    genre: null,
    market: null,
  },
  genreOptions: {},
  marketOptions: {},
  stationLists: {},
  stations: {},
  liveTakeoverWhitelist: [],
};

const reducer = createReducer(initialState, {
  [RECEIVE_ALL_STATION_TYPES]: receiveAllStationTypes,
  [RECEIVE_LIVE_META_DATA]: setLiveMetaData,
  [RECEIVE_LIVE_STATIONS]: receiveLiveStations,
  [RECEIVE_ONE_STATION]: receiveOneStation,
  [RECEIVE_SIMILAR_LIVE_STATIONS]: receiveSimilarLiveStations,
  [REMOVE_STATION]: removeStationFromHistory,
  [REQUEST_STATIONS]: requestStations,
  [SAVE_STATION]: saveStation,
  [SET_HIGHLIGHTS_METADATA]: setHighlightsMetadata,
  [SET_COUNTRY]: setCountry,
  [SET_COUNTRY_OPTIONS]: setCountryOptions,
  [SET_GENRE]: setGenre,
  [SET_IS_FAVORITE]: setIsFavorite,
  [SET_LAST_PLAYED_DATE]: setLastPlayedDate,
  [SET_MARKET]: setMarket,
  [SET_MARKET_AND_GENRE_OPTIONS]: setMarketAndGenreOptions,
  [SET_RE_PROFILE_DATA]: setRadioEditProfileData,
  [SET_RECENTLY_PLAYED]: setRecentlyPlayed,
  [UPDATE_THUMBS]: updateThumbs,
});

export default reducer;
