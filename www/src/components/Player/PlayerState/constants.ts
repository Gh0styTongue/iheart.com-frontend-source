import {
  CUSTOM_TYPES,
  LIVE_TYPES,
  PODCAST_TYPES,
  STATION_TYPE,
} from 'constants/stationTypes';
import { E } from 'shared/utils/Hub';
import { PLAYER_STATE } from 'constants/playback';

const { PLAYING, PAUSED, IDLE, LOADING, BUFFERING } = PLAYER_STATE;

export const playbackTypeMap = {
  ALBUM: [STATION_TYPE.ALBUM],
  CUSTOM: CUSTOM_TYPES,
  LIVE: LIVE_TYPES,
  MY_MUSIC: [STATION_TYPE.MY_MUSIC],
  PLAYLIST: [STATION_TYPE.COLLECTION],
  PODCAST: PODCAST_TYPES,
} as const;

export const playbackStateMap = {
  LOADING: [LOADING, BUFFERING],
  PAUSED: [PAUSED, IDLE],
  PLAYING: [PLAYING],
} as const;

export const playerStateChangeEvents = [
  E.Chromecast.MUTE,
  E.FAVORITE_CHANGE,
  E.LIVE_RAW_META,
  E.PLAY_STATE_CHANGED,
  E.STATION_LOADED,
  E.THUMB_CHANGED,
  E.TRACK_CHANGED,
  E.TRACK_CHANGED,
] as const;
