/* eslint-disable camelcase */

import getScript from 'utils/getScript';
import logger, { CONTEXTS } from 'modules/Logger';
import reduxFactory from 'state/factory';
import transport from 'api/transport';
import { getAmpUrl } from 'state/Config/selectors';
import { memoize } from 'lodash-es';
import { socialLogin } from 'state/Session/actions';
import { updateOauthCred } from 'state/Session/services';
import { waitForDocumentLoaded } from '@iheartradio/web.signal';

const store = reduxFactory();

let auth2;
let gapi;

/**
 * Construct the driver
 * @constructor
 * @param {Object} config configuration object with `GoogleClientId`, `androidAppId` & `country`
 */
function GooglePlus(config) {
  this.config = {
    appId: config.appId,
    clientId: config.clientId,
    country: config.country,
  };

  // Google plus config
  if (__CLIENT__) {
    window.___gcfg = {
      isSignedOut: true,
      lang: config.lang,
      parsetags: 'explicit',
    };
  }
}

// ### Public Methods

GooglePlus.prototype.isReady = memoize(function isReady() {
  // Try to get the SDK, reject after 5s timeout.
  return new Promise((resolve, reject) => {
    if (!__CLIENT__) {
      reject(new Error('Google Plus service is only available on browser'));
      return;
    }

    window.__gapiReady = () => {
      gapi = window.gapi;

      if (!gapi) {
        reject(new Error('gapi was not initialized'));
        return;
      }

      gapi.load('auth2', () => {
        auth2 = gapi.auth2.init({
          client_id: this.config.clientId,
          cookiepolicy: 'single_host_origin',
          immediate: false,
          requestvisibleactions: 'http://schemas.google.com/ListenActivity',
          scope:
            'https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile',
        });
        resolve();
      });
    };

    waitForDocumentLoaded().then(async () => {
      setTimeout(reject, 5000);

      await getScript(
        'https://apis.google.com/js/client:platform.js?onload=__gapiReady',
        'gPlusScript',
      ).then(undefined, reject);
    });
  });
});

GooglePlus.prototype.signin = function signin() {
  return this._gaSignin()
    .then(this._getProfile)
    .then(({ email, access_token, id }) =>
      store.dispatch(
        socialLogin({
          accessToken: access_token,
          email,
          provider: 'google',
          signupFlow: 'default',
          userId: id,
        }),
      ),
    );
};

/**
 * Links a Google plus account to a users profile
 */
GooglePlus.prototype.link = function link(ampId, ampToken) {
  return this._gaSignin()
    .then(this._getProfile)
    .then(session =>
      transport(
        updateOauthCred({
          accessToken: session.access_token,
          accessTokenType: 'google',
          ampUrl: getAmpUrl(store.getState()),
          profileId: ampId,
          sessionId: ampToken,
          uid: session.id,
        }),
      ).then(() => session.id),
    );
};

// ### Private Methods

/**
 * Signs a user into Google plus and promps the dialog to authorize the app.
 * **IMPORTANT**: Make sure G+ is loaded before calling this method
 * due to popup-blocker
 * @return {Promise}
 */
GooglePlus.prototype._gaSignin = function _gaSignin() {
  return new Promise((resolve, reject) => {
    if (auth2) {
      auth2
        .signIn()
        .then(() => {
          const authResult = auth2.currentUser.get().getAuthResponse();
          const profile = auth2.currentUser.get().getBasicProfile();
          resolve({
            access_token: authResult.access_token,
            email: profile.getEmail(),
            id: profile.getId(),
          });
        })
        .catch(error => {
          const errorMsg =
            (error && (error.error || error.description || error.message)) ||
            error;
          const err = new Error(errorMsg);
          err.type = 'gplus';
          err.payload = errorMsg;
          logger.error([CONTEXTS.AUTH, CONTEXTS.SOCIAL], errorMsg, {}, err);
          reject(err);
        });
    } else {
      const err = new Error('[Google error, auth2 is Undefined]');
      err.type = 'gplus';
      logger.error([CONTEXTS.AUTH, CONTEXTS.SOCIAL], err.message, {}, err);
      reject(err);
    }
  });
};

/**
 * Get the user's profile
 * @param  {Object}   authResult Authentication result object
 * @returns {Promise}
 */
GooglePlus.prototype._getProfile = function _getProfile(userInfo) {
  return new Promise((resolve, reject) => {
    // If there's no `access_token`, reject right away
    if (!userInfo || !userInfo.access_token) {
      const err = new Error(
        '[Google error, User info is not complete. User access token is undefined]',
      );
      err.type = 'gplus';
      err.payload = userInfo;
      return reject(err);
    }

    return resolve({
      access_token: userInfo.access_token,
      email: userInfo.email,
      id: userInfo.id,
    });
  });
};

export default GooglePlus;
