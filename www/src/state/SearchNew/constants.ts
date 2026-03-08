export const SET_SEARCH_QUERY = 'iHR/newSearch/SET_SEARCH_QUERY';
export const SET_SEARCH_FILTER = 'iHR/newSearch/SET_SEARCH_FILTER';
export const SET_SEARCH_MODE = 'iHR/newSearch/SET_SEARCH_MODE';
export const SET_SEARCH_QUERY_ID = 'iHR/newSearch/SET_SEARCH_QUERY_ID';

export const SEARCH_FILTERS: { [a: string]: string } = {
  ALBUM: 'bundle',
  ALL: '',
  ARTIST: 'artist',
  COLLECTION: 'playlist',
  LIVE: 'station',
  PODCAST: 'podcast',
  SONG: 'track',
} as const;

export const getKeyValue =
  <T extends Record<string, unknown>, U extends keyof T>(key: U) =>
  (obj: T) =>
    obj[key];
