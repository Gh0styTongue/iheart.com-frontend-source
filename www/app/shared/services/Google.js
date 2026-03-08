import jwtDecode from 'jwt-decode';
import logger, { CONTEXTS } from 'modules/Logger';
import reduxFactory from 'state/factory';
import transport from 'api/transport';
import { createEmitter } from 'utils/createEmitter';
import { getTranslateFunction } from 'state/i18n/helpers';
import { isPlainObject, isString } from 'lodash-es';
import { showNotifyGrowl } from 'state/UI/actions';
import { socialLogin } from 'state/Session/actions';

let codeClient;
const store = reduxFactory();
const translate = getTranslateFunction(store.getState());

const showLoginFailureGrowl = () => {
  store.dispatch(
    showNotifyGrowl({
      title: translate('Login unsuccessful. Please try again later.'),
      sticky: true,
    }),
  );
};

export const googleSdk = createEmitter({
  initialize({ appKey }) {
    if (!appKey) return false;

    const googleScript = document.createElement('script');
    googleScript.id = 'google-sdk';
    googleScript.src = 'https://accounts.google.com/gsi/client';
    googleScript.async = true;
    googleScript.defer = true;
    document.body.append(googleScript);

    return new Promise((resolve, reject) => {
      googleScript.addEventListener('load', () => {
        codeClient = google.accounts?.oauth2.initCodeClient({
          client_id: appKey,
          callback: async response => {
            if (!isPlainObject(response) || !isString(response.code)) {
              showLoginFailureGrowl();
              reject();
              return;
            }

            const tokenRequest = await transport({
              method: 'GET',
              url: '/api/v1/google/exchange-code/',
              params: {
                code: response.code,
              },
            });

            if (tokenRequest.status === 200) {
              const { accessToken, idToken } = tokenRequest.data;
              const decoded = jwtDecode(idToken);

              if (decoded.sub) {
                store.dispatch(
                  socialLogin({
                    accessToken,
                    email: decoded.email,
                    provider: 'google',
                    signupFlow: 'default',
                    userId: decoded.sub,
                  }),
                );
              } else {
                logger.error(
                  [CONTEXTS.AUTH, CONTEXTS.SOCIAL],
                  'Google JWT unable to be decoded',
                );
                showLoginFailureGrowl();
                reject();
              }
            } else {
              logger.error(
                [CONTEXTS.AUTH, CONTEXTS.SOCIAL],
                'Google code exchange failed',
              );
              showLoginFailureGrowl();
              reject();
            }
          },
          scope: 'profile email openid',
        });
        resolve(true);
      });
    });
  },
  login() {
    if (codeClient.requestCode) {
      codeClient.requestCode();
    } else {
      logger.error(
        [CONTEXTS.AUTH, CONTEXTS.SOCIAL],
        'Unable to request code from Google code client',
      );
      showLoginFailureGrowl();
    }
  },
  remove() {
    document.querySelector('script#google-sdk')?.remove();
  },
});
