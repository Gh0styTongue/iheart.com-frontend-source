import analytics, { Events } from 'modules/Analytics';
import { clearUserCookies } from 'state/Session/shims';
import { ConfirmContexts, ConnectedModals } from 'state/UI/constants';
import { debounce } from 'lodash-es';
import { getIsLoggedOut } from 'state/Session/selectors';
import {
  logoutAndStartAnonymousSession,
  sessionExpired,
} from 'state/Session/actions';
import { openModal } from 'state/UI/actions';
import { Store } from 'state/types';

// we only want to react to the first 401, especially for newly refreshed pages where several calls
// may come back unauthorized, so we debounce the handling for the errors that this interceptor
// is meant to handle.
export const attemptRefreshDebounced = debounce(
  (store: Store) => {
    const storeState = store.getState();

    clearUserCookies();

    if (!getIsLoggedOut(storeState)) {
      store.dispatch(sessionExpired(true));
      store.dispatch(
        openModal({
          id: ConnectedModals.Confirm,
          context: ConfirmContexts.ForcedLogout,
        }),
      );
    } else {
      store.dispatch(sessionExpired());
      store.dispatch(
        logoutAndStartAnonymousSession({ forced: true, noRedirect: true }),
      );
    }
  },
  1000,
  { leading: true, trailing: false },
);
