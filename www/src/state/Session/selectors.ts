import getUser from 'state/User/selectors';
import isBotClient from 'utils/isBotClient';
import { createSelector, createStructuredSelector } from 'reselect';
import { get } from 'lodash-es';
import { getIsGenreSelected } from 'state/Genres/selectors';
import { getLongProfileIdEnabled } from 'state/Features/selectors';
import { State as RootState, User } from 'state/buildInitialState';
import { State as SessionState } from 'state/Session/types';

export const getSession = createSelector<RootState, User, SessionState>(
  getUser,
  user => get(user, 'session', {}) as SessionState,
);

export const getProfileId = createSelector<
  RootState,
  SessionState,
  number | null
>(getSession, ({ profileId }) =>
  profileId ? parseInt(profileId as any as string, 10) : null,
);

export const getSessionId = createSelector<
  RootState,
  SessionState,
  string | null
>(getSession, ({ sessionId }) => sessionId);

export const getAnonId = createSelector<
  RootState,
  SessionState,
  string | number | null
>(getSession, ({ anonId }) => anonId);

export const getIsAnonymous = createSelector<RootState, SessionState, boolean>(
  getSession,
  ({ isAnonymous }) => isAnonymous,
);

export const getIsAuthenticated = createSelector<
  RootState,
  SessionState,
  boolean
>(getSession, ({ isAuthenticated }) => isAuthenticated);

export const getIsLoggedOut = createSelector<
  RootState,
  boolean,
  boolean,
  boolean
>(
  [getIsAnonymous, getIsAuthenticated],
  (isAnonymous, isAuthenticated) => isAnonymous || !isAuthenticated,
);

export const getAuthError = createSelector(getSession, session =>
  get(session, 'errorMessage', null),
);

export const getDeviceId = createSelector(
  getSession,
  session => session.deviceId,
);

export const getCredentials = createStructuredSelector<
  RootState,
  {
    anonId: string | number | null;
    genreSelected?: boolean;
    isAnonymous: boolean;
    isAuthenticated: boolean;
    isLoggedOut: boolean;
    profileId: number | null;
    sessionId: string | null;
  }
>({
  anonId: getAnonId,
  genreSelected: getIsGenreSelected,
  isAnonymous: getIsAnonymous,
  isAuthenticated: getIsAuthenticated,
  isLoggedOut: getIsLoggedOut,
  profileId: getProfileId,
  sessionId: getSessionId,
});

export const shouldUseLongProfileId = createSelector(
  getLongProfileIdEnabled,
  longProfileIdEnabled => isBotClient() || longProfileIdEnabled,
);
