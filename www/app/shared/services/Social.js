import * as Twitter from './Twitter';
import Facebook from './Facebook';
import GooglePlus from './GooglePlus';
import hub, { E } from '../utils/Hub';
import localStorage from 'utils/localStorage';
import LocalStorageKeys from 'constants/localStorageKeys';
import logger, { CONTEXTS } from 'modules/Logger';
import reduxFactory from 'state/factory';
import transport from 'api/transport';
import watch from 'redux-watch';
import { addParams, query as queryUtil } from 'utils/url';
import { createStructuredSelector } from 'reselect';
import { get } from 'lodash-es';
import { getAmpUrl, getCountryCode } from 'state/Config/selectors';
import {
  getCredentials,
  getIsAnonymous,
  getIsAuthenticated,
} from 'state/Session/selectors';
import {
  getFacebookAppId,
  getGooglePlusAppKey,
  getGooglePlusClientSecret,
} from 'state/Social/selectors';
import { getLang } from 'state/i18n/selectors';
import { getTranslateFunction } from 'state/i18n/helpers';
import { googleSdk } from './Google';
import { removeOauthCred } from 'state/Session/services';
import { savePropertyLocal } from 'state/Profile/actions';
import { showNotifyGrowl } from 'state/UI/actions';

const store = reduxFactory();
const userSelector = createStructuredSelector({
  isAuthenticated: getIsAuthenticated,
});

const TYPENAMES = { fb: 'Facebook', gplus: 'Google' };
// WEB-10193 - ZS - 12/13/2017
// redux-watch does not allow multiple subscriptions to the same declared watcher
// so we have to declare this auth watcher twice
const userWatcher = watch(() => userSelector(store.getState()));
const authWatcher = watch(() => userSelector(store.getState()));
const WARNING_KEY = 'facebook-warning-shown';

function Social() {
  const state = store.getState();
  const { isAuthenticated } = userSelector(state);

  if (isAuthenticated) {
    this.userChanged();
  }
  store.subscribe(
    userWatcher(() => {
      this.userChanged();
    }),
  );

  this.tw = Twitter;

  this.gplus = new GooglePlus({
    clientId: getGooglePlusAppKey(state),
    country: getCountryCode(state),
    lang: getLang(state),
  });

  this.google = googleSdk;
  try {
    this.google.initialize({
      appKey: getGooglePlusAppKey(state),
      clientSecret: getGooglePlusClientSecret(state),
    });
  } catch {
    // Do nothing
  }
  this._initFbBridge();
}

Social.prototype._initFbBridge = function _initFbBridge() {
  const isAnonymous = getIsAnonymous(store.getState());
  const query = queryUtil();
  let stationUrl;

  // Is there a specific radio station/musician?
  stationUrl = decodeURIComponent(query.radio_station || query.musician || '');

  // reload the window after login to the same url
  if (stationUrl) {
    stationUrl = addParams(stationUrl, { autoplay: true });
  }

  // If we're not authed & fb wants to login, try to do it
  if (isAnonymous && (query.fb_auto_login || stationUrl)) {
    return this.isReady().then(this.backgroundLogin.bind(this, 'fb'));
  }

  // Otherwise, redirect to that page
  if (stationUrl) window.location = stationUrl;

  return undefined;
};

Social.prototype.userChanged = function userChanged() {
  const state = store.getState();
  const { isAnonymous } = getIsAnonymous(state);

  this.fb = new Facebook({
    country: getCountryCode(state),
    fbAppId: getFacebookAppId(state),
    music: !isAnonymous,
  });
};

Social.prototype.isReady = function isReady() {
  return Promise.all([this.isGoogleReady(), this.isFacebookReady()]);
};

Social.prototype.isGoogleReady = function isGoogleReady() {
  return this.gplus?.isReady();
};

Social.prototype.isFacebookReady = function isFacebookReady() {
  return new Promise((resolve, reject) => {
    if (!__CLIENT__) {
      return reject(new Error('Facebook is only available on browser'));
    }

    const { isAuthenticated } = userSelector(store.getState());
    if (window.location.pathname === '/sdk/auth/') {
      this.userChanged();
      this.initFacebook().then(resolve);
    } else if (isAuthenticated) {
      this.initFacebook().then(resolve);
    } else {
      const unsubscribe = store.subscribe(
        authWatcher(() => {
          unsubscribe();
          this.userChanged();
          this.initFacebook().then(resolve);
        }),
      );
    }

    return undefined;
  });
};

Social.prototype.initFacebook = function initFacebook() {
  return this.fb.isReady().then(undefined, () => {
    // If 1 or more social services failed, defer warning until login/signup
    if (localStorage.getItem(WARNING_KEY, null)) {
      localStorage.setItem(WARNING_KEY, 1);
      localStorage.setItem(LocalStorageKeys.SocialTimeout, 1);
    }
  });
};

Social.prototype.backgroundLogin = function backgroundLogin(type) {
  if (type === 'fb') {
    return this.fb.backgroundLogin();
  }
  return Promise.reject(new Error('Unsupported social type'));
};

Social.prototype.link = function link(type) {
  const state = store.getState();
  const translate = getTranslateFunction(state);
  const { profileId, sessionId } = getCredentials(state);
  const isFBLink = type === 'fb'; // type should either be 'gplus' or 'fb'
  const typeName = TYPENAMES[type];
  return this.isReady()
    .then(() => {
      if (isFBLink) return this.fb.link(profileId, sessionId);
      return this.gplus?.link(profileId, sessionId);
    })
    .then(thirdPartyId => {
      store.dispatch(
        savePropertyLocal(
          isFBLink ? 'facebookId' : 'googlePlusId',
          thirdPartyId,
        ),
      );
      hub.trigger(E.AUTHENTICATED, isFBLink ? 'facebook' : 'gplus');
      store.dispatch(
        showNotifyGrowl({
          title: translate('Update successful.'),
          description: translate(
            'Your account has been linked to {provider}.',
            {
              provider: isFBLink ? 'Facebook' : 'Google',
            },
          ),
        }),
      );
    })
    .catch(err => {
      logger.error([CONTEXTS.AUTH, CONTEXTS.SOCIAL], {}, {}, err);
      const errors = get(err, ['response', 'data', 'errors'], []);

      errors.forEach(({ code }) => {
        if (code === 2) {
          store.dispatch(
            showNotifyGrowl({
              title: translate(
                'This {accountType} account is already linked to an iHeartRadio account',
                { accountType: typeName },
              ),
            }),
          );
        } else {
          store.dispatch(
            showNotifyGrowl({
              title: translate(
                '{accountType} account linking failed. Please try again later.',
                {
                  accountType: typeName,
                },
              ),
            }),
          );
        }
      });
    });
};

Social.prototype.unlink = function unlink(type) {
  return this.isReady().then(() => {
    const state = store.getState();
    const translate = getTranslateFunction(state);
    const isFBLink = type === 'fb'; // type should either be 'gplus' or 'fb'
    const typeName = TYPENAMES[type];
    const { profileId, sessionId } = getCredentials(state);
    return transport(
      removeOauthCred({
        ampUrl: getAmpUrl(state),
        profileId,
        provider: type,
        sessionId,
      }),
    ).then(
      () => {
        store.dispatch(
          savePropertyLocal(isFBLink ? 'facebookId' : 'googlePlusId', null),
        );
        store.dispatch(
          showNotifyGrowl({
            title: translate('Update successful.'),
            description: translate(
              'Your account has been unlinked from {provider}.',
              {
                provider: isFBLink ? 'Facebook' : 'Google',
              },
            ),
          }),
        );
      },
      () => {
        store.dispatch(
          showNotifyGrowl({
            title: translate(
              '{accountType} account unlinking failed. Please try again later.',
              {
                accountType: typeName,
              },
            ),
          }),
        );
      },
    );
  });
};

Social.prototype.parse = function parse(type) {
  if (type === 'fb') return this.fb.parse();
  return undefined;
};

Social.prototype.login = function login(type) {
  const state = store.getState();
  const translate = getTranslateFunction(state);
  // TODO: update all other methods to use the same type naming convention

  const loginTypes = {
    facebook: () => this.fb.login(),
    googleplus: () => this.google.login(),
  };

  return this.isReady().then(() =>
    loginTypes?.[type]?.()?.catch(error => {
      logger.error([CONTEXTS.AUTH, CONTEXTS.SOCIAL], {}, {}, error);

      const growlTitle =
        error.payload === 'popup_closed_by_user' ?
          translate(
            'Login unsuccessful. Window closed before completion. Please try again.',
          )
        : translate('Login unsuccessful. Please try again later.');

      store.dispatch(
        showNotifyGrowl({
          title: growlTitle,
          sticky: true,
        }),
      );
    }),
  );
};

Social.prototype.checkForPopUpError = function checkForPopUpError(errorMsg) {
  // popup_blocked_by_browser is an error that ie gives us.
  // popup_closed_by_user is thrown by google
  if (['popup_closed_by_user', 'popup_blocked_by_browser'].includes(errorMsg)) {
    const state = store.getState();
    const translate = getTranslateFunction(state);

    store.dispatch(
      showNotifyGrowl({
        title: translate('Do You Have a Popup Blocker?'),
        description: translate(
          "To log in with your Facebook or Google account, ensure you've allowed popups from www.iheart.com, refresh, and then try again.",
        ),
        sticky: true,
      }),
    );

    return true;
  }
  return false;
};

Social.prototype.getUserImageUrl = function getUserImageUrl(type, id) {
  switch (type) {
    case 'fb':
      return this.fb.getUserImageUrl(id);
    default:
      return undefined;
  }
};

const instance = new Social();

export const getInstance = () => (__CLIENT__ ? instance : new Social());
