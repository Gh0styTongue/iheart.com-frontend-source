import cookie from 'js-cookie';
import createTritonTransport from 'api/transport/createTritonTransport';
import { CONTEXTS } from 'modules/Logger';
import { fetchTritonSecureToken } from 'state/Ads/services';
import { getAds } from 'state/Live/selectors';
import { getAmpUrl } from 'state/Config/selectors';
import { getPodcastAdTargeting } from 'state/Podcast/selectors';
import { getProfileId, getSessionId } from 'state/Session/selectors';
import { getStation } from 'state/Playback/selectors';
import {
  getTFCDAgeLimitApplies,
  getTritonPartnerIds,
  getTritonPartnerUrl,
  getTritonSecureTokenData,
} from 'state/Ads/selectors';
import {
  NEW_CUSTOM_COMPANION,
  RECEIVE_STATION_TARGETTING,
  RECIEVE_TRITON_SECURE_TOKEN,
  SET_TFCD_AGE_LIMIT,
  SET_TRITON_PARTNER_IDS,
} from './constants';

export function customCompanion(companion) {
  return {
    payload: companion,
    type: NEW_CUSTOM_COMPANION,
  };
}

export function receiveStationTargettingParams(payload) {
  return { payload, type: RECEIVE_STATION_TARGETTING };
}

export function setProfileIds(payload) {
  return { payload, type: SET_TRITON_PARTNER_IDS };
}

export function setTritonPartnerIds() {
  return async (dispatch, getState) => {
    const tritonPartnerIdUrl = getTritonPartnerUrl(getState());
    if (!tritonPartnerIdUrl) return;

    const response = await createTritonTransport(tritonPartnerIdUrl);
    dispatch(setProfileIds(response.data));
  };
}

export function getTritonSecureToken() {
  return async (dispatch, getState, { transport, logger }) => {
    const state = getState();
    let { tritonSecureToken, tritonSecureTokenExpirationDate } =
      getTritonSecureTokenData(state);

    const podcastAdTargeting = getPodcastAdTargeting(state);
    const currentStation = getStation(state);
    const isLiveStation = currentStation?.type === 'live';

    const tritonProviderId =
      (isLiveStation ?
        getAds(state)?.provider_id
      : podcastAdTargeting?.providerId) ?? 'false';
    let refresh = false;
    try {
      tritonSecureToken = cookie.get('tritonSecureToken') || tritonSecureToken;
      tritonSecureTokenExpirationDate =
        cookie.get('tritonSecureTokenExpiration') ||
        tritonSecureTokenExpirationDate;
      refresh = cookie.get('tritonProviderId') !== tritonProviderId.toString();
    } catch (e) {
      logger.error(
        [CONTEXTS.REDUX, CONTEXTS.TRITON, 'getTritonSecureToken'],
        e,
      );
    }
    if (
      !refresh &&
      tritonSecureToken &&
      tritonSecureTokenExpirationDate &&
      tritonSecureTokenExpirationDate > Date.now() / 1000
    ) {
      return dispatch({
        payload: {
          token: tritonSecureToken,
          expirationDate: tritonSecureTokenExpirationDate,
        },
        type: RECIEVE_TRITON_SECURE_TOKEN,
      });
    } else {
      const tritonUid = getTritonPartnerIds(state)?.['triton-uid'];
      const profileId = getProfileId(state);
      const sessionId = getSessionId(state);
      try {
        const {
          data: { token, expirationDate },
        } = await transport(
          fetchTritonSecureToken(getAmpUrl(state), {
            tritonUid,
            tfcdApplies: getTFCDAgeLimitApplies(state),
            profileId,
            sessionId,
            providerId:
              tritonProviderId ? parseInt(tritonProviderId, 10) : false,
          }),
        );

        return dispatch({
          payload: {
            token,
            expirationDate,
          },
          type: RECIEVE_TRITON_SECURE_TOKEN,
          meta: {
            cookies: {
              set: {
                tritonSecureToken: {
                  value: token,
                  config: {
                    expires: 1,
                    path: '/',
                    samesite: 'None',
                    secure: window.location.protocol.includes('https'),
                  },
                },
                tritonSecureTokenExpiration: {
                  value: expirationDate,
                  config: {
                    expires: 1,
                    path: '/',
                    samesite: 'None',
                    secure: window.location.protocol.includes('https'),
                  },
                },
                tritonProviderId: {
                  value: tritonProviderId,
                  config: {
                    expires: 1,
                    path: '/',
                    samesite: 'None',
                    secure: window.location.protocol.includes('https'),
                  },
                },
              },
            },
          },
        });
      } catch (e) {
        logger.error(
          [
            CONTEXTS.REDUX,
            CONTEXTS.ADS,
            CONTEXTS.TRITON,
            RECIEVE_TRITON_SECURE_TOKEN,
          ],
          e,
        );
        return undefined;
      }
    }
  };
}

export function setTFCDAge(ageLimit) {
  return {
    payload: ageLimit,
    type: SET_TFCD_AGE_LIMIT,
  };
}
