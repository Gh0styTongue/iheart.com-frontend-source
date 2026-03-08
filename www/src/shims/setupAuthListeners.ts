import analytics from 'modules/Analytics';
import factory from 'state/factory';
import hub, { E } from 'shared/utils/Hub';
import whenPopulated from 'utils/whenPopulated';
import { fetchGenrePreferences, genresRequest } from 'state/Genres/actions';
import { fetchListenHistory } from 'state/Stations/actions';
import { getCurrentPath } from 'state/Routing/selectors';
import { getIsSDK } from 'state/Environment/selectors';
import { getProfileReceived } from 'state/Profile/selectors';
import { getSession } from 'state/Session/selectors';
import { getTEMPnoRefreshOnLogin } from 'state/Features/selectors';
import { queueRefresh } from 'state/Session/shims';
import { sessionRefreshed } from 'state/Session/actions';

const store = factory();

type Info = {
  profileId?: number;
  sessionId?: string;
};

// quick and dirty wait-until-a-thing-is-true function
function until(predicate: () => boolean, interval = 250, timeout = 5000) {
  let pollTimerId: number | null = null;
  let timeoutTimerId: number | null = null;

  const poll = (resolve: (value?: unknown) => void) => {
    // set a maximum time to wait
    if (!timeoutTimerId) {
      timeoutTimerId = window.setTimeout(resolve, timeout);
    }
    // if our predicate passes
    if (predicate()) {
      // clear the poll timeout if it exists
      if (pollTimerId) {
        window.clearTimeout(pollTimerId);
      }
      // and resolve
      resolve();
    } else {
      // clear the current poll timeout if it exists
      if (pollTimerId) {
        window.clearTimeout(pollTimerId);
      }
      // set a timeout to call `poll` again after the inverval
      pollTimerId = window.setTimeout(() => poll(resolve), interval);
    }
  };

  // Return a new promise that invokes the poll function
  return new Promise(poll);
}

function setupAuthListeners() {
  hub.on(E.AUTHENTICATED, async (info: Info = {}) => {
    const state = store.getState();
    const currentPath = getCurrentPath(state);
    const isSDK = getIsSDK(state);
    const { sessionExpired, isAnonymous: wasAnonymous } = getSession(state);
    const noRefreshOnLogin = getTEMPnoRefreshOnLogin(state);

    await whenPopulated<ReturnType<typeof getSession>>(
      store,
      getSession,
      ({ profileId, sessionId }) => !!profileId && !!sessionId,
    );

    // TODO: move this action so it's called in Session/actions.  We can't currently because it
    // causes a circular dep.
    await Promise.all([
      store.dispatch(fetchListenHistory()),
      store.dispatch(fetchGenrePreferences()), // IHRWEB-14944 - Need to send genre to analytics when logging in from any view
      store.dispatch(genresRequest()),
    ]);

    if (!info.sessionId || !info.profileId) return;

    if (
      !noRefreshOnLogin &&
      (wasAnonymous || sessionExpired) &&
      !currentPath.includes('/upgrade') &&
      !isSDK
    ) {
      // avoid race-conditions in safari, wait until the call to getProfile has succeeded and then
      // we can refresh the browser
      await whenPopulated(store, getProfileReceived);

      // this call is to ensure that any unauthorized responses encountered while attempting to
      // recover from an an expired session do not result in further attempts to refresh the session
      store.dispatch(sessionRefreshed());

      // TODO: when all data stores are reduxified (i.e. do not use an 'isReady') we can and should remove this.
      // wait until analytics is not tracking and the tracking queue is empty
      await until(
        () => analytics.isTracking === false && analytics.queue.size === 0,
      ).then(() => queueRefresh(window.location.href));
    }
  });
}

export default setupAuthListeners;
