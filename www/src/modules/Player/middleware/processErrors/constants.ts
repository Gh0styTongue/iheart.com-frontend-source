import {
  PlayerErrorState,
  PlayerWarningState,
} from 'modules/Player/constants/playerState';

export enum JWErrorTypes {
  Error = 'error',
  PlayAttemptFailed = 'playAttemptFailed',
  SetupError = 'setupError',
  Warning = 'warning',
}

export enum ErrorTypes {
  Error = 'error',
  Warning = 'warning',
}

export const JWErrorCodes = {
  224003: 224003,
  232002: 232002,
  232006: 232006,
  232011: 232011,
  303220: 303220,
};

export const ERROR_TYPES = {
  [JWErrorTypes.Error]: ErrorTypes.Error,
  [JWErrorTypes.PlayAttemptFailed]: ErrorTypes.Warning,
  [JWErrorTypes.SetupError]: ErrorTypes.Error,
  [JWErrorTypes.Warning]: ErrorTypes.Warning,
  DEFAULT: ErrorTypes.Error,
};

export const ERROR_SUB_TYPES = {
  [JWErrorCodes[224003]]: PlayerErrorState.InvalidMedia,
  [JWErrorCodes[232002]]: PlayerErrorState.NetworkError,
  [JWErrorCodes[232006]]: PlayerErrorState.NetworkError,
  [JWErrorCodes[232011]]: PlayerErrorState.AccessDenied,
  [JWErrorCodes[303220]]: PlayerWarningState.AutoplayBlocked,
  [JWErrorTypes.Error]: PlayerErrorState.PlayerError,
  [JWErrorTypes.PlayAttemptFailed]: PlayerWarningState.PlayAttemptFailed,
  [JWErrorTypes.SetupError]: PlayerErrorState.SetupError,
  [JWErrorTypes.Warning]: PlayerWarningState.Warning,
  MEDIA_PLAYBACK_ERROR: PlayerErrorState.MediaPlaybackError,
  DEFAULT: PlayerErrorState.UnknownError,
};
