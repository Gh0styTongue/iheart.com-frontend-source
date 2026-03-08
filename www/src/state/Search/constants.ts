export const SET_SEARCH_QUERY = 'iHR/search/SET_SEARCH_QUERY';
export const SET_SEARCH_FILTER = 'iHR/search/SET_SEARCH_FILTER';
export const SET_SEARCH_MODE = 'iHR/search/SET_SEARCH_MODE';

export const SEARCH_FILTERS = {
  ALBUM: 'albums',
  BUNDLE: 'bundle',
  ALL: '',
  ARTIST: 'artist',
  COLLECTION: 'playlist',
  LIVE: 'station',
  PODCAST: 'podcast',
  SONG: 'track',
} as const;
