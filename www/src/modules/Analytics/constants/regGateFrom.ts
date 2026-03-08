export const REG_GATE_TYPES = {
  HARD_GATE: 'hard_gate',
  SOFT_GATE: 'soft_gate',
} as const;

export const REG_GATE_EXIT_TYPES = {
  DISMISS: 'dismiss',
  EMAIL: 'register|email',
  LOG_IN: 'login',
  REGISTER_EMAIL: 'register|email',
  REGISTER_FACEBOOK: 'register|facebook',
  REGISTER_GOOGLE: 'register|google',
  REGISTER_TWITTER: 'register|twitter',
} as const;

export const REG_GATE_TRIGGER_TYPES = {
  ARTIST_STATION_FAVORITE: 'artist_station_favorite',
  ARTIST_STATION_PLAY: 'artist_station_play',
  ARTIST_STATION_THUMB: 'artist_station_thumb',
  LIVE_STATION_FAVORITE: 'live_station_favorite',
  LIVE_STATION_PLAY: 'live_station_play',
  LIVE_STATION_THUMB: 'live_station_thumb',
  LOG_IN: 'log_in',
  MY_STATION_PAGE: 'my_station_page',
  PLAYLIST_STATION_PLAY: 'playlist_station_play',
  PODCAST_STATION_PLAY: 'podcast_station_play',
  UPSELL_PAGE: 'upsell_page',
} as const;

export const locationMap = {
  artist_favorite: REG_GATE_TRIGGER_TYPES.ARTIST_STATION_FAVORITE,
  artist_play: REG_GATE_TRIGGER_TYPES.ARTIST_STATION_PLAY,
  artist_thumb: REG_GATE_TRIGGER_TYPES.ARTIST_STATION_THUMB,
  live_favorite: REG_GATE_TRIGGER_TYPES.LIVE_STATION_FAVORITE,
  live_thumb: REG_GATE_TRIGGER_TYPES.LIVE_STATION_THUMB,
  playlist_play: REG_GATE_TRIGGER_TYPES.PLAYLIST_STATION_PLAY,
  podcast_play: REG_GATE_TRIGGER_TYPES.PODCAST_STATION_PLAY,
  profile: REG_GATE_TRIGGER_TYPES.LOG_IN,
  softgate: REG_GATE_TRIGGER_TYPES.LIVE_STATION_PLAY,
  'subscribing-IHEART_US_PLUS_TRIAL': REG_GATE_TRIGGER_TYPES.UPSELL_PAGE,
  'subscribing-IHEART_US_PREMIUM_TRIAL': REG_GATE_TRIGGER_TYPES.UPSELL_PAGE,
  track_play: REG_GATE_TRIGGER_TYPES.ARTIST_STATION_PLAY,
  'user profile': REG_GATE_TRIGGER_TYPES.MY_STATION_PAGE,
} as const;
