import getScript from 'utils/getScript';
import reduxFactory from 'state/factory';
import transport from 'api/transport';
import { getAmpUrl } from 'state/Config/selectors';
import { getFacebookLang } from 'state/i18n/selectors';
import { join as joinURL } from 'utils/url';
import { memoize } from 'lodash-es';
import { socialLogin } from 'state/Session/actions';
import { updateOauthCred } from 'state/Session/services';
import { waitForDocumentLoaded } from '@iheartradio/web.signal';

const store = reduxFactory();

const domain =
  __CLIENT__ ? `${window.location.protocol}//${window.location.host}/` : '/';

type LoginError = Error & {
  type?: string;
  payload?: string | fb.StatusResponse;
};

/**
 * Check for session & token in the session.
 * @param  {Function} resolve   Resolves the promise
 * @param  {Function} reject    Reject the promise
 * @param  {Object} loginResp   Response from Facebook
 */
function _handleSession(
  resolve: (value: fb.AuthResponse) => void,
  reject: (reason?: LoginError) => void,
  loginResp: { authResponse: fb.AuthResponse },
) {
  const session = loginResp.authResponse;
  // If we didn't get session or accessToken from session, reject this
  if (!session || !session.accessToken) {
    const err: LoginError = new Error();
    err.type = 'facebook';
    err.payload = '[social.fb] No access token';
    return reject(err);
  }
  return resolve(session);
}

type FacebookConfig = {
  fbAppId: string;
  music: boolean;
};

type FacebookInstance = {
  config: FacebookConfig;
  login: (signupFlow: string) => void;
  _getProfile: (
    session: fb.AuthResponse,
  ) => Promise<fb.AuthResponse & { email: string }>;
  getShareUrl(ampId: number, url: string): string;
  link(profileId: number, sessionId: string): void;
  backgroundLogin: () => void;
  parse(el: HTMLElement): void;
  getUserImageUrl(id: number): void;
  isReady: () => Promise<void>;
  getFBSession: () => Promise<fb.AuthResponse>;
};

interface FacebookConstructor {
  new (): FacebookInstance;
  prototype: FacebookInstance;
  getShareUrl(ampId: number, url: string): string;
  imageUrl(id: number, width?: number, height?: number): string;
}

/**
 * Facebook service
 * @constructor
 * @param {Object} config Configuration object with `fbAppId` and `music`
 */
const Facebook: FacebookConstructor = function Facebook(
  this: FacebookInstance,
  config: FacebookConfig,
) {
  this.config = config;
} as any;

Facebook.prototype.isReady = memoize(function isReady(this: FacebookInstance) {
  // eslint-disable-next-line @typescript-eslint/no-this-alias
  const self = this;
  if (typeof window === 'undefined') {
    return Promise.reject(
      new Error('Facebook service is only available on browser'),
    );
  }
  return new Promise((resolve, reject) => {
    const lang = getFacebookLang(store.getState());
    waitForDocumentLoaded().then(async () => {
      setTimeout(reject, 5000);

      await getScript(
        `https://connect.facebook.net/${lang}/sdk.js`,
        'facebookScript',
      ).then(resolve, reject);
    });
  }).then(() => {
    // Reject if FB is not intialized
    if (!window.FB) {
      throw new Error('FB is not initialized');
    }
    window.FB.init({
      appId: self.config.fbAppId,
      channelUrl: `${domain}misc/fb_channel/`,
      music: self.config.music,
      oauth: true,
      status: true,
      version: 'v3.2',
      xfbml: true,
    });
  });
});

Facebook.prototype.getFBSession = function getFBSession() {
  return new Promise<fb.AuthResponse>((resolve, reject) => {
    window.FB!.login(_handleSession.bind(null, resolve, reject), {
      scope: 'email,user_gender,user_location,user_birthday,user_link',
    });
  });
};

/**
 * Login to FB
 * @param  {String} signupFlow Signup flow (softgate/default). Defaults to `default`
 * @return {Promise}
 */
Facebook.prototype.login = function login(signupFlow) {
  // for whatever reason, putting isReady() here causes FB authentication to get blocked on Safari (WEB-5325)
  return this.getFBSession()
    .then(this._getProfile)
    .then(({ email, accessToken, userID }) =>
      store.dispatch(
        socialLogin({
          accessToken,
          email,
          provider: 'fb',
          signupFlow,
          userId: userID,
        }),
      ),
    );
};

/**
 * Link an FB account to iHeart
 * @param  {Number} ampId    AMP Profile ID
 * @param  {String} ampToken AMP Auth Token
 * @return {Promise}         Fulfilled when done
 */
Facebook.prototype.link = function link(profileId: number, sessionId: string) {
  return this.isReady()
    .then(
      () =>
        new Promise<fb.AuthResponse>((resolve, reject) => {
          window.FB!.login(_handleSession.bind(null, resolve, reject), {
            scope: 'email,user_gender,user_location,user_birthday,user_link',
          });
        }),
    )
    .then(session =>
      transport(
        updateOauthCred({
          accessToken: session.accessToken,
          accessTokenType: 'fb',
          ampUrl: getAmpUrl(store.getState()),
          profileId,
          sessionId,
          uid: session.userID,
          useUnauthorizedInterceptor: false,
        }),
      ).then(() => session.userID),
    );
};

/**
 * Silently login FB in the background
 * @return {Promise}
 */
Facebook.prototype.backgroundLogin = function backgroundLogin() {
  return this.isReady()
    .then(
      () =>
        new Promise<fb.AuthResponse>((resolve, reject) => {
          // Get the login status 1st to make sure we're connected
          window.FB!.getLoginStatus(resp => {
            if (!resp || resp.status !== 'connected') {
              const err: LoginError = new Error(
                'Attempted background login; FB did not provide a session',
              );
              err.type = 'facebook';
              err.payload = resp;
              throw err;
            }

            // then attempt to handle the session
            return _handleSession(resolve, reject, resp);
          });
        }),
    )
    .then(this._getProfile)
    .then(({ email, accessToken, userID }) =>
      store.dispatch(
        socialLogin({
          accessToken,
          email,
          provider: 'fb',
          signupFlow: 'default',
          userId: userID,
        }),
      ),
    );
};

/**
 * Parse UI Element & convert it into FB XML
 * @param  {DOMElement} el DOM Element to be parsed
 * @return {Promise}
 */
Facebook.prototype.parse = function parse(el: HTMLElement) {
  return this.isReady().then(() => window.FB!.XFBML.parse(el));
};

// ### Static Methods

/**
 * Share a URL to Facebook
 * @param  {Number} ampId User AMP ID
 * @param  {String} url   URL to share
 * @returns {String} Full URL to share
 */
function getShareUrl(ampId: number, url: string) {
  // Add tracking params
  const shareUrl = `${url}${
    url.indexOf('?') > -1 ? '&' : '?'
  }pname=fb&campid=s&keyid=${ampId}`;
  return `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
    joinURL(domain, shareUrl),
  )}`;
}

Facebook.prototype.getShareUrl = getShareUrl;
Facebook.getShareUrl = getShareUrl;

/**
 * Get URL of a user's source profile pic
 * @param  {Number} id User ID
 * @return {Promise<String>}
 */
Facebook.prototype.getUserImageUrl = function getUserImageUrl(id: number) {
  return this.isReady().then(
    () =>
      new Promise((resolve, reject) =>
        window.FB!.api(
          `/${id}/picture`,
          { height: 2000, redirect: 0, width: 2000 },
          (resp: null | { error?: string; data?: { url: string } }) => {
            if (!resp) {
              return reject(new Error('No FB Response'));
            }
            if (resp.error) {
              return reject(resp.error);
            }

            return resolve(resp.data!.url);
          },
        ),
      ),
  );
};

// ### Private Methods
/**
 * Get FB Profile from /me endpoint.
 * @param  {FBSession} session    Facebook session
 * @return {Promise}            Fulfilled when the request finishes
 */
Facebook.prototype._getProfile = function _getProfile(
  session: fb.AuthResponse,
) {
  return new Promise((resolve, reject) =>
    window.FB!.api<{ error: string; email: string }>('/me', resp => {
      if (!resp) {
        return reject(new Error('No FB Response'));
      }
      if (resp.error) {
        return reject(resp.error);
      }

      // email is not part of the default public profile, so it can be null
      return resolve({ ...session, email: resp.email });
    }),
  );
};

export default Facebook;
