// https://developer.jwplayer.com/jwplayer/docs/jw8-player-errors-reference
export const JW_ERRORS = {
  ACCESS_DENIED: 232011,
  INVALID_MEDIA: 224003,
  NETWORK_OFFLINE_ERROR: 232002,
  NETWORK_HTTP_ERROR: 232006,
};

export enum PlayerUIErrors {
  GenericInvalidMedia = 'GenericInvalidMedia',
  PodcastInvalidMedia = 'PodcastInvalidMedia',
}
