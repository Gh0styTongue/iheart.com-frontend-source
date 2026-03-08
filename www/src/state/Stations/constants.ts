export const REQUEST_LISTEN_HISTORY = 'iHR/Stations/REQUEST_LISTEN_HISTORY';
export const REJECT_LISTEN_HISTORY = 'iHR/Stations/REJECT_LISTEN_HISTORY';
export const RECEIVE_STATIONS = 'iHR/Stations/RECEIVE_STATIONS';
export const RECEIVE_LISTEN_HISTORY = 'iHR/Stations/RECEIVE_LISTEN_HISTORY';
export const SET_LAST_PLAYED_DATE = 'iHR/Stations/SET_LAST_PLAYED_DATE';
export const REMOVE_STATION = 'iHR/Stations/REMOVE_STATION';

export const stationTypeMap = {
  ARTIST: 'custom',
  COLLECTION: 'collection',
  CURATED: 'custom',
  CUSTOM: 'custom',
  FAVORITES: 'custom',
  FEATUREDSTATION: 'custom',
  LIVE: 'live',
  PLAYLIST_RADIO: 'custom',
  PODCAST: 'podcast',
  TALKSHOW: 'podcast',
} as const;

export const UPDATE_THUMBS = 'iHR/Stations/UPDATE_THUMBS';

export const THUMB_STRINGS = {
  DOWN: 'thumb_down',
  UNTHUMB: 'unthumb',
  UP: 'thumb_up',
} as const;

export const SENTIMENT_MAP = {
  '-1': 'DOWN',
  1: 'UP',
} as const;

export const SAVE_STATION = 'iHR/Stations/SAVE_STATION';
