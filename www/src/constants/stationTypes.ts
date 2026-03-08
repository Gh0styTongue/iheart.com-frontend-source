export const SEED_TYPE: {
  [key: string]: string;
} = {
  ALBUM: 'album',
  ARTIST: 'artist',
  SONG: 'song',
};

export type StationTypeValue =
  | 'album'
  | 'artist'
  | 'collection'
  | 'custom'
  | 'episode'
  | 'favorites'
  | 'featured'
  | 'live'
  | 'mymusic'
  | 'playlistradio'
  | 'my_playlist'
  | 'podcast'
  | 'song'
  | 'talk'
  | 'track';

export type PlaybackTypeValue =
  | 'album'
  | 'artist'
  | 'collection'
  | 'favorites'
  | 'live'
  | 'mymusic'
  | 'my_playlist'
  | 'playlistradio'
  | 'podcast'
  | 'track';

export const STATION_TYPE: { [key: string]: StationTypeValue } = {
  ALBUM: 'album',
  ARTIST: 'artist',
  COLLECTION: 'collection',
  CUSTOM: 'custom',
  FAVORITES: 'favorites',
  FEATURED: 'featured',
  LIVE: 'live',
  MY_MUSIC: 'mymusic',
  PLAYLIST_RADIO: 'playlistradio',
  MY_PLAYLIST: 'my_playlist',
  PODCAST: 'podcast',
  SONG: 'song',
  TALK: 'talk',
  TALK_EPISODE: 'episode',
  TRACK: 'track',
};

export type StationType = (typeof STATION_TYPE)[keyof typeof STATION_TYPE];

export const LIVE_TYPES: Array<StationTypeValue> = [STATION_TYPE.LIVE];

export const ON_DEMAND_TYPES: Array<StationTypeValue> = [
  STATION_TYPE.MY_MUSIC,
  STATION_TYPE.COLLECTION,
  STATION_TYPE.ALBUM,
];

export const UPSELL_TYPES: Array<StationTypeValue> = [
  STATION_TYPE.ALBUM,
  STATION_TYPE.PLAYLIST_RADIO,
  STATION_TYPE.TRACK,
];

export const COLLECTION_TYPES: Array<StationTypeValue> = [
  STATION_TYPE.COLLECTION,
  STATION_TYPE.PLAYLIST_RADIO,
  STATION_TYPE.MY_PLAYLIST,
];

export const CUSTOM_TYPES: Array<StationTypeValue> = [
  STATION_TYPE.CUSTOM,
  STATION_TYPE.ARTIST,
  STATION_TYPE.TRACK,
  STATION_TYPE.FAVORITES,
  STATION_TYPE.FEATURED,
  STATION_TYPE.PLAYLIST_RADIO,
  STATION_TYPE.MY_PLAYLIST,
];

export const PODCAST_TYPES: Array<StationTypeValue> = [
  STATION_TYPE.TALK,
  STATION_TYPE.TALK_EPISODE,
  STATION_TYPE.PODCAST,
];
