import Events from 'modules/Analytics/constants/events';
import {
  ampResetPwRequest,
  loginCreateOauth,
  login as loginQuery,
  loginRegSync as loginRegSyncService,
} from './services';
import {
  CLEAR_SESSION_ERROR,
  INVALID_USER_OR_PASSWORD_CODES,
  LOGOUT,
  RECEIVE_ANONYMOUS_SESSION,
  RECEIVE_SESSION,
  REJECT_SESSION,
  REQUEST_SESSION,
  SESSION_EXPIRED,
  SESSION_REFRESHED,
  SET_DEVICE_ID,
  SHORT_LIVED_TOKEN_EXPIRED,
  SOCIAL_AUTH,
} from './constants';
import {
  clearUserCookies,
  getActiveSessionFromCookies,
  queueRefresh,
} from './shims';
import { CONTEXTS } from 'modules/Logger';
import {
  createOrUpgrade,
  getInvalidEmailAndPasswordText,
  getPleaseTryAgainText,
  getRegSyncTokenFromUrl,
  getSignupErrorText,
  makeAnonymousUsername,
  removeRegSyncTokenFromUrl,
} from './helpers';
import { E } from 'shared/utils/Hub';
// we don't pull events from modules/Analytics/index to avoid a circular dep
import countryCodes from 'constants/countryCodes';
import { get, merge } from 'lodash-es';
import { getAmpUrl, getCountryCode, getHost } from 'state/Config/selectors';
import { getCurrentPath } from 'state/Routing/selectors';
import {
  getDeviceId,
  getIsAuthenticated,
  shouldUseLongProfileId,
} from 'state/Session/selectors';
import { getIsMobile } from 'state/Environment/selectors';
import {
  getLongProfileIdEnabled,
  getResetPasswordIncludeLogin,
  getTEMPnoRefreshOnLogin,
} from 'state/Features/selectors';
import { getProfile, receiveProfile } from 'state/Profile/actions';
import { getSubscriptionType } from 'state/Entitlements/selectors';
import { loadEntitlements } from 'state/Entitlements/actions';
import { requestUserLocationConfig } from 'state/Config/actions';

export const getDefaultCookieMetadata = () => ({
  expires: 30 * 6,
  path: '/',
  samesite: 'None',
  secure: window.location.protocol.includes('https'),
});

export function requestSession() {
  return { type: REQUEST_SESSION };
}

export function receiveSession(profileId, sessionId) {
  return {
    meta: {
      analytics: {
        data: {
          user: {
            profileId: String(profileId),
          },
        },
      },
      braze: { profileId },
      hub: [
        {
          args: [{ profileId, sessionId }],
          event: E.AUTHENTICATED,
        },
      ],
    },
    payload: { profileId, sessionId },
    type: RECEIVE_SESSION,
  };
}

export function receiveAnonymousSession(profileId, sessionId, anonId) {
  return {
    meta: {
      analytics: { data: { user: { profileId: String(profileId) } } },
    },
    payload: { anonId, profileId, sessionId },
    type: RECEIVE_ANONYMOUS_SESSION,
  };
}

export function loginError(error) {
  return (dispatch, getState) =>
    dispatch({
      error: true,
      payload:
        INVALID_USER_OR_PASSWORD_CODES.includes(error.code) ?
          getInvalidEmailAndPasswordText(getState())
        : getPleaseTryAgainText(getState()),
      type: REJECT_SESSION,
    });
}

export function receiveNewSession(
  authSource,
  authPayload,
  isNewProfileId,
  country,
  subType,
) {
  const { profileId, sessionId, oauths } = authPayload;
  const email = oauths.reduce((accumulator, { type, oauthUuid }) => {
    if (type.toLowerCase() === 'ihr') {
      // eslint-disable-next-line no-param-reassign
      accumulator = oauthUuid;
    }
    return accumulator;
  }, '');
  return {
    meta: {
      analytics: { data: { user: { profileId: String(profileId) } } },
      cookies: {
        remove: [
          {
            config: { path: '/' },
            key: 'auuid',
          },
          { config: { path: '/' }, key: 'tritonSecureToken' },
          { config: { path: '/' }, key: 'tritonSecureTokenExpiration' },
        ],
        set: {
          aid: {
            config: getDefaultCookieMetadata(),
            value: sessionId,
          },
          country: {
            config: getDefaultCookieMetadata(),
            value: country,
          },
          pid: {
            config: getDefaultCookieMetadata(),
            value: profileId,
          },
          userType: {
            config: getDefaultCookieMetadata(),
            value: subType.toLowerCase(),
          },
          timeZone: {
            cookie: getDefaultCookieMetadata(),
            value: Intl.DateTimeFormat().resolvedOptions().timeZone,
          },
        },
      },
      hub: [
        {
          args: [authPayload],
          event: E.AUTHENTICATED,
        },
      ],
      isNewProfileId,
    },
    payload: { profileId, sessionId },
    type: RECEIVE_SESSION,
  };
}

export function receiveNewAnonymousSession(
  profileId,
  sessionId,
  anonId,
  authPayload,
) {
  return {
    meta: {
      analytics: { data: { user: { profileId: String(profileId) } } },
      cookies: {
        remove: [{ config: { path: '/' }, key: 'country' }],
        set: {
          aid: {
            config: getDefaultCookieMetadata(),
            value: sessionId,
          },
          auuid: {
            config: getDefaultCookieMetadata(),
            value: authPayload.oauths[0].oauthUuid,
          },
          pid: {
            config: getDefaultCookieMetadata(),
            value: profileId,
          },
          userType: {
            config: getDefaultCookieMetadata(),
            value: 'anonymous',
          },
          timeZone: {
            cookie: getDefaultCookieMetadata(),
            value: Intl.DateTimeFormat().resolvedOptions().timeZone,
          },
        },
      },
      hub: [
        {
          args: [authPayload],
          event: E.AUTHENTICATED,
        },
      ],
    },
    payload: { anonId, profileId, sessionId },
    type: RECEIVE_ANONYMOUS_SESSION,
  };
}

export function startAnonymousSession() {
  return (dispatch, getState, { logger, transport }) => {
    const state = getState();

    const { anonId } = getActiveSessionFromCookies();

    dispatch(requestSession());
    return transport(
      loginCreateOauth({
        accessToken: 'anon',
        ampUrl: getAmpUrl(state),
        deviceId: getDeviceId(state),
        deviceName: getIsMobile(getState()) ? 'web-mobile' : 'web-desktop',
        email: makeAnonymousUsername(anonId),
        host: getHost(state),
        longProfileId: shouldUseLongProfileId(state),
        oauthUid: anonId,
        provider: 'anon',
      }),
    )
      .then(({ data }) => {
        const { accountType, profileId, sessionId } = data;
        const anonymousId = data.oauths[0].oauthUuid;
        dispatch(receiveProfile({ accountType }));
        return dispatch(
          receiveNewAnonymousSession(profileId, sessionId, anonymousId, data),
        );
      })
      .then(() => dispatch(loadEntitlements()))
      .catch(response => {
        logger.error(
          [CONTEXTS.REDUX, CONTEXTS.AUTH, CONTEXTS.ANONYMOUS],
          response,
        );
        dispatch(loginError(response));
        throw new Error(response);
      });
  };
}

export function receiveOauthSession({
  email,
  sessionId,
  profileId,
  country,
  subType,
  authResponse,
}) {
  return {
    meta: {
      cookies: {
        remove: [
          {
            config: { path: '/' },
            key: 'auuid',
          },
          { config: { path: '/' }, key: 'tritonSecureToken' },
          { config: { path: '/' }, key: 'tritonSecureTokenExpiration' },
        ],
        set: {
          aid: {
            config: getDefaultCookieMetadata(),
            value: sessionId,
          },
          country: {
            config: getDefaultCookieMetadata(),
            value: country,
          },
          pid: {
            config: getDefaultCookieMetadata(),
            value: profileId,
          },
          userType: {
            config: getDefaultCookieMetadata(),
            value: subType,
          },
          timeZone: {
            cookie: getDefaultCookieMetadata(),
            value: Intl.DateTimeFormat().resolvedOptions().timeZone,
          },
        },
      },
      hub: [{ args: [authResponse], event: E.AUTHENTICATED }],
    },
    payload: authResponse,
    type: SOCIAL_AUTH,
  };
}

export function socialLogin({
  email,
  accessToken,
  userId,
  provider,
  signupFlow,
}) {
  return async function thunk(dispatch, getState, { transport, logger }) {
    const state = getState();
    try {
      const { data } = await transport(
        loginCreateOauth({
          accessToken,
          ampUrl: getAmpUrl(state),
          deviceId: getDeviceId(state),
          deviceName: getIsMobile(getState()) ? 'web-mobile' : 'web-desktop',
          email,
          host: getHost(state),
          longProfileId: getLongProfileIdEnabled(state),
          oauthUid: userId,
          provider,
        }),
      );
      dispatch(
        receiveOauthSession({
          authResponse: data,
          country: getCountryCode(state),
          email,
          profileId: data.profileId,
          provider,
          sessionId: data.sessionId,
          subType: getSubscriptionType(state),
        }),
      );
      await Promise.all([dispatch(loadEntitlements()), dispatch(getProfile())]);
      return data;
    } catch ({ data: err }) {
      logger.error(
        [CONTEXTS.REDUX, CONTEXTS.AUTH, CONTEXTS.SOCIAL, signupFlow, provider],
        err,
      );
      const error =
        err.payload && err.payload.firstError && err.payload.firstError;
      const modifiedError = new Error();
      modifiedError.type = 'login';
      modifiedError.payload = error;
      throw modifiedError;
    }
  };
}

export function shortLivedTokenExpired() {
  return {
    type: SHORT_LIVED_TOKEN_EXPIRED,
  };
}

export function loginRegSync(token) {
  return (dispatch, getState, { logger, transport }) => {
    const storedSession = getActiveSessionFromCookies();

    dispatch(requestSession());
    return new Promise(resolve => {
      const state = getState();
      transport(
        loginRegSyncService({
          ampUrl: getAmpUrl(state),
          deviceId: getDeviceId(state),
          deviceName: getIsMobile(getState()) ? 'web-mobile' : 'web-desktop',
          host: getHost(state),
          token,
        }),
      )
        .then(({ data }) => {
          const { profileId } = data;
          const storedProfileId = storedSession.profileId || null;
          const isNewProfileId = profileId !== storedProfileId;

          resolve(
            dispatch(
              receiveNewSession(
                'short-lived-token',
                data,
                isNewProfileId,
                getCountryCode(state),
                getSubscriptionType(state),
              ),
            ),
          );
        })
        .then(() =>
          Promise.all([dispatch(loadEntitlements()), dispatch(getProfile())]),
        )
        .catch(error => {
          logger.error([CONTEXTS.REDUX, CONTEXTS.AUTH], error);
          if (
            error.response.data.firstError &&
            error.response.data.firstError.description === 'Token has expired'
          ) {
            dispatch(shortLivedTokenExpired());
          }
          removeRegSyncTokenFromUrl();
          resolve(dispatch(startAnonymousSession()));
        });
    });
  };
}

export function setDeviceId(deviceId) {
  return {
    meta: {
      cookies: {
        set: {
          deviceId: {
            config: { path: '/', expires: 60 * 60 * 24 * 90 },
            value: deviceId,
          },
        },
      },
    },
    payload: deviceId,
    type: SET_DEVICE_ID,
  };
}

export function authenticate() {
  return async dispatch => {
    const storedSession = getActiveSessionFromCookies();
    const regSyncToken = getRegSyncTokenFromUrl();

    dispatch(setDeviceId(storedSession.deviceId));

    if (regSyncToken) {
      return dispatch(loginRegSync(regSyncToken));
    }

    if (!storedSession.isAnonymous) {
      const result = dispatch(
        receiveSession(storedSession.profileId, storedSession.sessionId),
      );
      await Promise.all([dispatch(loadEntitlements()), dispatch(getProfile())]);
      return result;
    }

    if (storedSession.profileId && storedSession.isAnonymous) {
      const result = dispatch(
        merge(
          receiveAnonymousSession(
            storedSession.profileId,
            storedSession.sessionId,
            storedSession.anonId,
          ),
          {
            meta: {
              cookies: {
                remove: [{ config: { path: '/' }, key: 'country' }],
                set: {
                  aid: {
                    config: getDefaultCookieMetadata(),
                    value: storedSession.sessionId,
                  },
                  auuid: {
                    config: getDefaultCookieMetadata(),
                    value: storedSession.anonId,
                  },
                  pid: {
                    config: getDefaultCookieMetadata(),
                    value: storedSession.profileId,
                  },
                  userType: {
                    config: getDefaultCookieMetadata(),
                    value: 'anonymous',
                  },
                  timeZone: {
                    cookie: getDefaultCookieMetadata(),
                    value: Intl.DateTimeFormat().resolvedOptions().timeZone,
                  },
                },
              },
              hub: [
                {
                  args: [
                    {
                      profileId: storedSession.profileId,
                      sessionId: storedSession.sessionId,
                    },
                  ],
                  event: E.AUTHENTICATED,
                },
              ],
            },
          },
        ),
      );
      dispatch(receiveProfile({ accountType: 'ANONYMOUS' }));
      await dispatch(loadEntitlements());
      return result;
    }

    return dispatch(startAnonymousSession());
  };
}

export function checkExistingAuth() {
  return async dispatch => {
    const storedSession = getActiveSessionFromCookies();
    const regSyncToken = getRegSyncTokenFromUrl();

    dispatch(setDeviceId(storedSession.deviceId));

    if (regSyncToken) {
      return dispatch(loginRegSync(regSyncToken));
    }
    if (storedSession.profileId && !storedSession.isAnonymous) {
      const result = dispatch(
        receiveSession(storedSession.profileId, storedSession.sessionId),
      );
      await Promise.all([dispatch(loadEntitlements()), dispatch(getProfile())]);
      return result;
    }
    if (storedSession.profileId && storedSession.isAnonymous) {
      const result = dispatch(
        receiveAnonymousSession(
          storedSession.profileId,
          storedSession.sessionId,
          storedSession.anonId,
        ),
      );
      await dispatch(loadEntitlements());
      return result;
    }
    return undefined;
  };
}

export function logout(forced = false) {
  return {
    meta: {
      ...(!forced ?
        {
          analytics: {
            data: {
              logout: {
                reason: 'user',
              },
            },
            event: Events.Logout,
          },
        }
      : {}),
      cookies: {
        remove: [
          { config: { path: '/' }, key: 'aid' },
          { config: { path: '/' }, key: 'pid' },
          { config: { path: '/' }, key: 'country' },
          { config: { path: '/' }, key: 'userType' },
          { config: { path: '/' }, key: 'tritonSecureToken' },
          { config: { path: '/' }, key: 'tritonSecureTokenExpiration' },
        ],
      },
      hub: [{ event: E.LOGOUT }],
    },
    type: LOGOUT,
  };
}

export function logoutAndStartAnonymousSession({
  forced = false,
  noRedirect = false,
  showLogin = false,
}) {
  return async (dispatch, getState, { logger }) => {
    // Clear existing session
    await dispatch(logout(forced));

    // TODO: Move all cookie and localStorage setting to middleware
    clearUserCookies();

    try {
      // Start a new anonymous session
      const result = await dispatch(startAnonymousSession());
      // Refresh after everything's done
      // TODO: stop doing this when no parts of the app get session info from cookies that were set on pageload
      if (!getTEMPnoRefreshOnLogin(getState())) {
        let url = '/';

        if (noRedirect) {
          url = window.location.href;
        } else if (showLogin) {
          url = '/?showLogin=true';
        }
        queueRefresh(url);
      }

      return result;
    } catch (e) {
      logger.error(
        [CONTEXTS.REDUX, CONTEXTS.AUTH, CONTEXTS.ANONYMOUS, CONTEXTS.LOGOUT],
        e,
      );
      throw e;
    }
  };
}

export function rejectSession(errorMessage) {
  return {
    error: true,
    payload: errorMessage,
    type: REJECT_SESSION,
  };
}

export function registerSuccess(authResponse, country, subType) {
  const { profileId, sessionId, oauths } = authResponse;
  const email = oauths.reduce((accumulator, { type, oauthUuid }) => {
    if (type.toLowerCase() === 'ihr') {
      // eslint-disable-next-line no-param-reassign
      accumulator = oauthUuid;
    }
    return accumulator;
  }, '');

  return {
    meta: {
      braze: { profileId },
      cookies: {
        remove: [
          {
            config: { path: '/' },
            key: 'auuid',
          },
          { config: { path: '/' }, key: 'tritonSecureToken' },
          { config: { path: '/' }, key: 'tritonSecureTokenExpiration' },
        ],
        set: {
          aid: {
            config: getDefaultCookieMetadata(),
            value: sessionId,
          },
          country: {
            config: getDefaultCookieMetadata(),
            value: country,
          },
          pid: {
            config: getDefaultCookieMetadata(),
            value: profileId,
          },
          userType: {
            config: getDefaultCookieMetadata(),
            value: subType.toLowerCase(),
          },
          timeZone: {
            cookie: getDefaultCookieMetadata(),
            value: Intl.DateTimeFormat().resolvedOptions().timeZone,
          },
        },
      },
      hub: [{ args: [authResponse], event: E.AUTHENTICATED }],
    },
    payload: {
      profileId,
      sessionId,
    },
    type: RECEIVE_SESSION,
  };
}

export function login(userName, password) {
  return (dispatch, getState, { logger, transport }) => {
    dispatch(requestSession());
    return dispatch(requestUserLocationConfig(userName)).then(() => {
      const state = getState();
      return transport(
        loginQuery({
          ampUrl: getAmpUrl(state),
          deviceId: getDeviceId(getState()),
          deviceName: getIsMobile(getState()) ? 'web-mobile' : 'web-desktop',
          host: getHost(state),
          password,
          userName,
        }),
      )
        .catch(response => {
          const error = get(response, ['response', 'data', 'firstError'], null);
          if (get(response, ['response', 'code'], 500) < 500 && response.data) {
            const errors = response.data.errors || [];
            // eslint-disable-next-line no-console
            console.log(errors);
          }
          return Promise.reject(error);
        })
        .then(({ data: result }) =>
          dispatch(
            receiveNewSession(
              'email',
              result,
              false,
              getCountryCode(state),
              getSubscriptionType(state),
            ),
          ),
        )
        .then(() =>
          Promise.all([dispatch(loadEntitlements()), dispatch(getProfile())]),
        )
        .catch(result => {
          logger.error([CONTEXTS.REDUX, CONTEXTS.AUTH], result);
          dispatch(loginError(result));
          throw result;
        });
    });
  };
}

export function loginAndGetProfile(userName, password) {
  return (dispatch, getState) =>
    dispatch(login(userName, password)).then(() => {
      if (getIsAuthenticated(getState())) {
        return dispatch(getProfile());
      }
      // This can happen if the user needs to verify their email. Other code shows the verification modal.
      return Promise.reject(new Error('User cannot be logged in at this time'));
    });
}

export function register(params) {
  return (dispatch, getState, { transport, logger }) => {
    const state = getState();
    const countryCode = getCountryCode(state);

    return transport(createOrUpgrade(state, params))
      .then(({ data }) => {
        if (countryCode === countryCodes.CA) {
          localStorage.setItem('showCanadaPrivacyModal', true);
        }
        dispatch(getProfile(false));
        dispatch(loadEntitlements());
        return dispatch(
          registerSuccess(data, countryCode, getSubscriptionType(state)),
        );
      })
      .catch(rawErr => {
        logger.error([CONTEXTS.REDUX, CONTEXTS.AUTH], rawErr);

        const error = get(rawErr, ['response', 'data', 'firstError']);
        if (!error) {
          throw rawErr;
        }

        return dispatch({
          error: true,
          payload: getSignupErrorText(error),
          type: REJECT_SESSION,
        });
      });
  };
}

export function clearAuthError() {
  return { type: CLEAR_SESSION_ERROR };
}

export function generateResetPwEmail(email) {
  return (dispatch, getState, { logger, transport }) => {
    const state = getState();
    return transport(
      ampResetPwRequest(
        getAmpUrl(state),
        email,
        getResetPasswordIncludeLogin(state),
        getCurrentPath(state),
      )(),
    )
      .then(data => (data.errors ? Promise.reject(data.errors[0]) : data))
      .catch(e => {
        logger.error([CONTEXTS.REDUX, CONTEXTS.AUTH], e);
        return Promise.reject(e.response);
      });
  };
}

export function sessionExpired(isLogout = false) {
  return {
    meta: {
      ...(isLogout ?
        {
          analytics: {
            data: {
              logout: {
                reason: 'forced',
              },
            },
            event: Events.Logout,
          },
        }
      : {}),
      cookies: {
        remove: [
          { config: { path: '/' }, key: 'aid' },
          { config: { path: '/' }, key: 'pid' },
          { config: { path: '/' }, key: 'country' },
          { config: { path: '/' }, key: 'userType' },
          { config: { path: '/' }, key: 'tritonSecureToken' },
          { config: { path: '/' }, key: 'tritonSecureTokenExpiration' },
        ],
      },
    },
    type: SESSION_EXPIRED,
  };
}

export function sessionRefreshed() {
  return {
    type: SESSION_REFRESHED,
  };
}
