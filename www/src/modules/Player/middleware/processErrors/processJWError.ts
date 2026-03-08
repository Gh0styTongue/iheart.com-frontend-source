import {
  ERROR_SUB_TYPES,
  ERROR_TYPES,
  ErrorTypes,
  JWErrorTypes,
} from './constants';
import type { JWError, ProcessedError } from './types';

export default function processJWError(
  source = {} as JWError,
  event: ErrorTypes | JWErrorTypes,
  trigger: (event: ErrorTypes | JWErrorTypes, data: JWError) => void = (
    _e,
    _d,
  ) => {},
): ProcessedError | JWError {
  if (!Object.values(ErrorTypes).includes(event as ErrorTypes)) {
    if (Object.values(JWErrorTypes).includes(event as JWErrorTypes)) {
      trigger(ERROR_TYPES[event], source);
    }
    return source;
  }

  const { code, type } = source;

  // check if we specifically handle this error code
  let subType = ERROR_SUB_TYPES[code];

  // we handle the jw player 23 series of error codes separately,
  // if the specific error code isn't handled above
  if (!subType && code >= 230000 && code < 240000) {
    subType = ERROR_SUB_TYPES.MEDIA_PLAYBACK_ERROR;
  }

  // handle by error type if no error code handling.
  // default to unknown error, but PROCESSED_ERRORS[type] should be a catchall
  if (!subType) {
    subType = ERROR_SUB_TYPES[type] || ERROR_SUB_TYPES.DEFAULT;
  }

  const processedError = {
    source,
    subType,
    type: ERROR_TYPES[type] || ERROR_TYPES.DEFAULT,
  };

  return processedError;
}
