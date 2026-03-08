import qs from 'qs';
import { createUser, upgradeAnonAccount } from './services';
import { getAmpUrl, getHost } from 'state/Config/selectors';
import { getCredentials, getDeviceId } from 'state/Session/selectors';
import { getIsMobile } from 'state/Environment/selectors';
import { getLongProfileIdEnabled } from 'state/Features/selectors';
import { getTranslateFunction } from 'state/i18n/helpers';

export function makeAnonymousUsername(anonId) {
  return `anon${anonId}`;
}

export function getRegSyncTokenFromUrl() {
  if (__CLIENT__) {
    return qs.parse(window.location.search.slice(1)).loginToken;
  }
  return null;
}

export function removeRegSyncTokenFromUrl() {
  const queryStringObject = qs.parse(window.location.search.slice(1));
  delete queryStringObject.loginToken;
  const preQueryString = window.location.href.split('?')[0];
  const queryString = qs.stringify(queryStringObject);
  if (queryString) {
    window.history.pushState(
      {},
      'remove loginToken',
      `${preQueryString}?${queryString}`,
    );
  } else {
    window.history.pushState({}, 'remove loginToken', `${preQueryString}`);
  }
}

export function getInvalidEmailAndPasswordText(state) {
  const translate = getTranslateFunction(state);
  const invalidText = translate(
    'Email or password is invalid. Please try again.',
  );
  return { text: invalidText, spoken: null };
}

export function getPleaseTryAgainText(state) {
  const translate = getTranslateFunction(state);
  const pleaseTryAgainText = translate(
    'Sorry, an error occurred. Please try again later.',
  );
  return { text: pleaseTryAgainText, spoken: null };
}

export function getSignupErrorText(error) {
  switch (error.code) {
    case 101:
    case 103: {
      return {
        text: 'There may already be a user with this email, try logging in',
        spoken: null,
      };
    }
    case 109: {
      return { text: "That doesn't look like an email address", spoken: null };
    }
    case 140: {
      return {
        text: 'Your password does not meet password requirements',
        spoken: null,
      };
    }
    case 141: {
      return {
        text: "Password shouldn't have common words or passwords",
        spoken: null,
      };
    }
    case 143: {
      return {
        text: 'Password can only have English letters, numbers, spaces, and special characters from: . ! ? - _ , ; : /  ( ) [ ] ~ @ # $ % ^ & * + = \' " ` |  { } < >',
        spoken:
          'Password can only have English letters, numbers, spaces, and special characters from: dot, exclamation point, question mark, dash, underscore, comma, semicolon, colon, forward slash, backslash, open parenthesis, close parenthesis, open bracket, close bracket, tilde, at sign, number sign, dollar sign, percent sign, caret, ampersand, asterisk, plus sign, equal sign, apostrophe, quotation mark, grave accent, vertical bar, open curly bracket, close curly bracket, less than sign, and greater than sign',
      };
    }
    default: {
      if (error.description) {
        return { text: error.description, spoken: null };
      } else {
        return { text: 'Unknown error', spoken: null };
      }
    }
  }
}

const isLongProfileId = profileId => Number(profileId) > 2147483647;

/**
 * Force create a user with a fresh short id if not longProfileId POC and
 * we receive an anon long profile id
 *
 * @param {boolean} longProfileIdEnabled
 * @param {number} profileId
 * @returns boolean
 *
 * Long profile ids are ids greater than the max unsigned INT (2147483647 or 0x7FFFFFFF)
 * Long Profile IDs have limited support accross the IHR flagship ecosystem
 * While we are testing long profile id on web, utilizing feature flag `longProfileId`
 * to determine if we should force create with a short id
 */
const getForceCreate = (longProfileIdEnabled, profileId) =>
  !longProfileIdEnabled && isLongProfileId(profileId);

export function createOrUpgrade(state, params) {
  const { isAuthenticated, isAnonymous, anonId, sessionId, profileId } =
    getCredentials(state);
  const ampUrl = getAmpUrl(state);
  const host = getHost(state);
  const deviceId = getDeviceId(state);
  const deviceName = getIsMobile(state) ? 'web-mobile' : 'web-desktop';

  return (
      isAuthenticated &&
        isAnonymous &&
        !getForceCreate(getLongProfileIdEnabled(state), profileId)
    ) ?
      upgradeAnonAccount({
        ampUrl,
        deviceId,
        deviceName,
        host,
        params: {
          ...params,
          longProfileId: !!isLongProfileId(profileId),
          oauthUuid: anonId,
          profileId,
          sessionId,
        },
      })
    : createUser({
        ampUrl,
        deviceId,
        deviceName,
        host,
        params,
      });
}
