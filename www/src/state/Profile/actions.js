import cookie from 'js-cookie';
import getUser from 'state/User/selectors';
import { CONTEXTS } from 'modules/Logger';
import {
  getAmpUrl,
  getCountryCode,
  getPIIRegulationConfig,
} from 'state/Config/selectors';
import {
  getBillingHistory,
  getProfileQuery,
  linkAlexaToIOSViaAmp,
  savePreferenceQuery,
  savePrivacyPreferences,
  updateProfileQuery,
} from './services';
import { getCredentials } from '../Session/selectors';
import { getDefaultCookieMetadata } from 'state/Session/actions';
import { getQueryParams } from 'state/Routing/selectors';
import { getTranslateFunction } from 'state/i18n/helpers';
import {
  LINK_IOS_TO_ALEXA,
  RECEIVE_PROFILE,
  REJECT_PROFILE,
  REQUEST_PROFILE,
  REQUEST_RECURLY_HISTORY,
  SAVE_IS_UNDERAGE,
  SAVE_PREFERENCE,
  SAVE_PROPERTY,
  TOGGLE_PII_BLOCKING,
} from './constants';
import { PIIBlockingType } from './types';
import { showNotifyGrowl } from 'state/UI/actions';

export function requestProfile() {
  return { type: REQUEST_PROFILE };
}

export function rejectProfile(error) {
  return {
    payload: error,
    type: REJECT_PROFILE,
  };
}

export function requestRecurlyHistory() {
  return (dispatch, getState, { transport }) => {
    const { profileId, sessionId } = getCredentials(getState());
    transport(
      getBillingHistory({
        ampUrl: getAmpUrl(getState()),
        profileId,
        sessionId,
      }),
    ).then(({ data }) =>
      dispatch({
        payload: data,
        type: REQUEST_RECURLY_HISTORY,
      }),
    );
  };
}

export function receiveProfile(profile) {
  const { email, birthYear, gender, accountType, zipCode } = profile;
  return {
    meta: {
      analytics: {
        data: {
          user: {
            registration: {
              birthYear,
              gender: gender === 'unspecified' ? 'prefer not to say' : gender,
              type: accountType,
              zip: zipCode,
            },
          },
        },
      },
      cookies: {
        set: {
          timeZone: {
            cookie: getDefaultCookieMetadata(),
            value: Intl.DateTimeFormat().resolvedOptions().timeZone,
          },
        },
      },
      braze: {
        email,
      },
    },
    payload: profile,
    type: RECEIVE_PROFILE,
  };
}

export function getProfile(isUpdateProfileId = false) {
  return async (dispatch, getState, { logger, transport }) => {
    await dispatch(requestProfile());
    const state = getState();
    const { profileId, sessionId } = getCredentials(state);

    return transport(
      getProfileQuery({
        ampUrl: getAmpUrl(state),
        profileId,
        sessionId,
      }),
    )
      .then(({ data }) => {
        if (isUpdateProfileId) {
          const translate = getTranslateFunction(state);
          dispatch(
            showNotifyGrowl({
              title: translate('You are now logged in as {profileName}', {
                profileName: data.name,
              }),
            }),
          );
        }
        dispatch(receiveProfile({ preferences: {}, ...data }));
      })
      .catch(err => {
        logger.error([CONTEXTS.REDUX, CONTEXTS.AUTH], err);
      });
  };
}

export function updateContactInfo({ name, phoneNumber, postalCode }) {
  return function (dispatch, getState, { transport }) {
    const state = getState();
    const { profileId, sessionId } = getCredentials(state);
    const ampUrl = getAmpUrl(state);

    return transport(
      updateProfileQuery({
        ampUrl,
        profileId,
        sessionId,
        valuesToUpdate: { name, phoneNumber, zipCode: postalCode },
      }),
    ).then(resp => {
      if (resp?.errors) {
        throw new Error(resp?.errors?.description ?? resp?.errors);
      }
      dispatch(receiveProfile({ name, phoneNumber, zipCode: postalCode }));
    });
  };
}

export function updatePrivacyPreferences({ requestType, complianceType }) {
  return function (dispatch, getState, { transport }) {
    const state = getState();
    const ampUrl = getAmpUrl(state);
    const { profileId, sessionId } = getCredentials(state);
    const countryCode = getCountryCode(state);
    const { profile } = getUser(state);
    const { email, name } = profile;
    const [first, last] = name?.split(' ') ?? '';

    return transport(
      savePrivacyPreferences({
        ampUrl,
        profileId,
        sessionId,
        complianceType,
        requestType,
        stateOfResidence: countryCode,
        email: email || `${profileId}@iheart-anon.com`,
        firstName: first || '',
        lastName: last || '',
      }),
    ).then(resp => {
      if (resp?.errors) {
        throw new Error(resp?.errors?.description ?? resp?.errors);
      }
    });
  };
}

export function savePreferenceLocal(key, value) {
  return {
    payload: {
      key,
      value,
    },
    type: SAVE_PREFERENCE,
  };
}

export function savePreference(key, value) {
  return (dispatch, getState, { transport }) => {
    const { profileId, sessionId } = getCredentials(getState());
    dispatch(savePreferenceLocal(key, value));
    return transport(
      savePreferenceQuery({
        ampUrl: getAmpUrl(getState()),
        key,
        profileId,
        sessionId,
        value,
      }),
    );
  };
}

export function savePropertyLocal(key, value) {
  return {
    payload: {
      key,
      value,
    },
    type: SAVE_PROPERTY,
  };
}

export function setIsUnderAge(isUnderAge) {
  return {
    payload: { isUnderAge },
    type: SAVE_IS_UNDERAGE,
  };
}

// GPC - Global Privacy Control
// A global setting defined by browser (or plugin) that is mean to treat the user as an opted out user. More info here: https://globalprivacycontrol.org/
export function gpcEnabled() {
  if (__CLIENT__ && window) {
    return window.navigator.globalPrivacyControl || false;
  }

  return false;
}

export function isPrivacyOptOut(types = []) {
  const isGPCEnabled = gpcEnabled();
  return isGPCEnabled === false ?
      types.some(type => type.trim().toUpperCase() === PIIBlockingType.CCPA)
    : isGPCEnabled;
}

export function togglePIIBlocking(
  piiBlockingTypes = [],
  piiOverrideNew,
  piiOverrideOld = [],
) {
  let piiOverride = piiOverrideOld;
  if (piiOverrideNew !== undefined) {
    piiOverride =
      Array.isArray(piiOverrideNew) ? piiOverrideNew : [piiOverrideNew];
    try {
      piiOverride = JSON.parse(piiOverrideNew);
      if (!Array.isArray(piiOverride)) piiOverride = [piiOverride];
      // eslint-disable-next-line no-empty
    } catch (e) {}
  }
  piiOverride = piiOverride.filter(Boolean);

  const types =
    (piiOverride.length ? piiOverride : piiBlockingTypes).filter(Boolean) || [];

  const privacyOptOut = isPrivacyOptOut(types);

  return {
    meta: {
      analytics: { data: { user: { privacyOptOut } } },
      cookies: {
        set: {
          piiBlocking: { config: { path: '/' }, value: types },
          piiOverride: { config: { path: '/' }, value: piiOverride },
        },
      },
    },
    payload: types,
    type: TOGGLE_PII_BLOCKING,
  };
}

export function getPIIBlockingFromState(state) {
  const { enabled } = getPIIRegulationConfig(state);

  const piiOverrideOld = JSON.parse(cookie.get('piiOverride') || '[]');
  const { piiOverride: piiOverrideNew } = getQueryParams(state);

  return [enabled, piiOverrideOld, piiOverrideNew];
}

export function checkPIIBlockingType(typeFromAmp = []) {
  return function thunk(dispatch, getState) {
    const state = getState();
    const [enabled, piiOverrideOld, piiOverrideNew] =
      getPIIBlockingFromState(state);

    if (enabled || piiOverrideNew !== undefined || piiOverrideOld.length > 0) {
      // we want overrides to persist beyond navigation and refreshes to make testing easier,
      // so if we have an override cookie, then we throw away the value unless we're pulling in a new
      // override (so if you want to get rid of the override you can use ?ccpa=false).
      dispatch(togglePIIBlocking(typeFromAmp, piiOverrideNew, piiOverrideOld));
    }
  };
}

export function linkIOSToAlexa({ code, url }) {
  return async function linkIOSToAlexaThunk(
    dispatch,
    getState,
    { transport, logger },
  ) {
    const { profileId, sessionId } = getCredentials(getState());
    try {
      await transport(
        linkAlexaToIOSViaAmp({
          ampUrl: getAmpUrl(getState()),
          profileId,
          sessionId,
          amazonAuthCode: code,
          redirectUri: url,
        }),
      );
      dispatch({
        type: LINK_IOS_TO_ALEXA,
        payload: { success: true },
      });
    } catch (err) {
      logger.error([CONTEXTS.REDUX, CONTEXTS.AUTH, 'linkIOSToAlexa'], err);
      dispatch({
        type: LINK_IOS_TO_ALEXA,
        payload: { success: false },
      });
    }
  };
}
