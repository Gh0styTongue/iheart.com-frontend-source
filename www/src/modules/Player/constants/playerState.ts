enum PlayerState {
  Buffering = 'buffering',
  Complete = 'complete',
  Idle = 'idle',
  Loading = 'loading',
  Paused = 'paused',
  PlayAttempt = 'playAttempt',
  Playing = 'playing',
}

export enum PlayerErrorState {
  AccessDenied = 'accessDenied',
  InvalidMedia = 'invalidMedia',
  MediaPlaybackError = 'mediaPlaybackError',
  NetworkError = 'networkError',
  PlayerError = 'playerError',
  SetupError = 'setupError',
  UnknownError = 'unknownError',
  UnsupportedCountry = 'unsupportedCountry',
}

export enum PlayerErrorType {
  PlaybackFailure = 'playback_failure',
  NetworkError = 'network_error',
}

export enum PlayerWarningState {
  AutoplayBlocked = 'autoplayBlocked',
  PlayAttemptFailed = 'playAttemptFailed',
  Warning = 'warning',
}

export default PlayerState;
