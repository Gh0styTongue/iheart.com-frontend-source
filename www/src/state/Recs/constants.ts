export const REC_TYPE = {
  ARTIST: 'ARTIST',
  CURATED: 'CURATED',
  DL: 'DL',
  LIVE: 'LIVE',
  N4U: 'N4U',
  RECOMMENDATION: 'recommendation',
};

export const CAMPAIGN_IDS = {
  NO_PLAYLISTS: 'foryou_favorites',
  WITH_PLAYLISTS: 'foryou_collections',
};

export const MOST_POPULAR_ARTISTS_CATEGORY_ID = 102;
export const FOR_YOU_CATEGORY_ID = 112;
export const PODCAST_RECS_CATEGORY_ID = 113;
export const NO_CUSTOM_TEMPLATE = 'LRRM,DL,LRRM,LR';
export const RECEIVE_RECS = 'RECS/RECEIVE_RECS';
export const SET_CAN_LOAD_MORE = 'RECS/SET_CAN_LOAD_MORE';
export const PLAYLIST_RECS_CATEGORY_ID = 120;

/**
 * There may be more subTypes, these are the ones that are explicitly accounted for
 * within state/Recs
 */
export const SUB_TYPES = {
  ARTIST: 'ARTIST',
  FAVORITES: 'FAVORITES',
  LINK: 'LINK',
  LIVE: 'LIVE',
  TRACK: 'TRACK',
};
