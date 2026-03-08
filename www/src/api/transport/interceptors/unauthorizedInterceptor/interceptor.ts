import logger, { CONTEXTS } from 'modules/Logger';
import { attemptRefreshDebounced } from './helpers';
import { getSession } from 'state/Session/selectors';
import { Store } from 'state/types';

export default function makeUnauthorizedInterceptor(getStore: () => Store) {
  return function unauthorizedInterceptor(error: any): any {
    const store = getStore();
    const state = store.getState();
    const statusCode = error?.response?.status ?? 0;
    const ampV1ErrorCode = error?.response?.data?.firstError?.code ?? 0;
    const ampV2ErrorCode = error?.response?.data?.error?.code ?? 0;
    const useInterceptor =
      error?.response?.data?.useUnauthorizedInterceptor ?? true;
    if (
      __CLIENT__ &&
      useInterceptor &&
      (statusCode === 401 ||
        (statusCode === 400 &&
          (ampV1ErrorCode === 2 || ampV2ErrorCode === 101)))
    ) {
      const errObj = error instanceof Error ? error : new Error(error);
      logger.error([CONTEXTS.FORCED_LOGOUT], error, {}, errObj);
      if (
        // if we're currently handling an expired session, we shouldn't initiate handling again.
        // this specifically targets 401s from getProfile and loadEntitlements which fire as a result of
        // getting a new session
        !getSession(state).sessionExpired
      ) {
        // in addition to the sessionExpired lock, we debounce our session renewal handling in case
        // more than one 401 *outside of the renewal flow* gets fired within 1 second of each other.
        attemptRefreshDebounced(store);
      }
    }
    return Promise.reject(error);
  };
}
