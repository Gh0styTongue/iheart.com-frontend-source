/* eslint-disable camelcase */
import getAudienceData from 'ads/playback/lib/getAudienceData';
import qs from 'qs';
import reduxFactory from 'state/factory';
import { addParams } from 'utils/url';
import { AUDIO_AD_PROVIDER } from 'ads/constants';
import { cloneDeep, omit, pick } from 'lodash-es';
import { getBlockedPIIBehaviors } from 'state/Profile/selectors';
import { getCountryCode, getPIIRegulationConfig } from 'state/Config/selectors';
import { getCurrentUrl } from 'ads/playback/customInStreamAd/lib/getTritonVastAd';
import { getIsMobile } from 'state/Environment/selectors';
import { getLocale } from 'state/i18n/selectors';
import { getPodcastAdTargeting } from 'state/Podcast/selectors';
import { getPodcastTritonTokenEnabled } from 'state/Features/selectors';
import { getSearch } from 'state/Routing/selectors';
import { getSubscriptionType } from 'state/Entitlements/selectors';
import {
  getTritonPartnerIds,
  getTritonSecureTokenData,
} from 'state/Ads/selectors';
import { STATION_TYPE } from 'constants/stationTypes';
import { SUBSCRIPTION_TYPE } from 'constants/subscriptionConstants';
import type { Station } from '../PlayerState';

type Tracking = Record<string, any>;
type TrackingParamFunction = (
  station: Station,
  trackingParams: Tracking,
) => Tracking;

const store = reduxFactory();

export const MANDATORY_TRITON_PARAMS: Array<keyof Tracking> = [
  'partnertok',
  'us_privacy',
  'host',
  'listenerId',
  'profileid',
  'streamId',
  'subscription_type',
  'playedFrom',
  'locale',
];

export const SANITIZED_STREAM_PARAMS = ['birthYear', 'age', 'gender', 'ccaud'];

export function getPIICompliantTrackingParams(trackingInfo: Tracking) {
  const state = store.getState();
  let trackingInfoWithPIIReg = cloneDeep(trackingInfo);
  // documentation for us_privacy is attached to this ticket: https://ihm-it.atlassian.net/browse/IHRWEB-14560
  if (getBlockedPIIBehaviors(state).sanitizeStreams) {
    trackingInfoWithPIIReg = {
      ...omit(trackingInfo, SANITIZED_STREAM_PARAMS),
      us_privacy: '1-Y-',
    };
  } else if (getPIIRegulationConfig(state).enabled) {
    trackingInfoWithPIIReg = {
      ...trackingInfo,
      us_privacy: '1-N-',
    };
  }

  return trackingInfoWithPIIReg;
}

export const COMMON_TRACKING_PARAM_KEYS = [
  'clientType',
  'host',
  'listenerId',
  'modTime',
  'profileid',
  'terminalid',
  'territory',
] as const;

export const COMMON_LIVE_TRACKING_PARAM_KEYS = [
  ...COMMON_TRACKING_PARAM_KEYS,
  'us_privacy',
] as const;

export const OTHER_COMMON_PARAM_KEYS = [
  'callLetters',
  'devicename',
  'dist',
  'stationid',
] as const;

export const ALL_COMMON_PARAM_KEYS = [
  ...COMMON_TRACKING_PARAM_KEYS,
  ...OTHER_COMMON_PARAM_KEYS,
] as const;

/**
 * IHRWEB-15810 - 10/6/2020 - Joe Fensler
 * Monetization wants to trim down on the number of tracking
 * params being sent to Revma when requesting a stream.
 *
 * Common live tracking params between Adswizz and Triton live ads include:
 * - callLetters
 * - clientType
 * - devicename
 * - dist
 * - host
 * - listenerid
 * - modTime
 * - profileid
 * - streamid - added to streamUrl as a query param before calling processStreamUrl
 * - terminalid
 * - territory
 * - us_privacy - added by getReportableTrackingParams
 * - zip - added to streamUrl as a query param before calling processStreamUrl
 */
export const getCommonLiveTrackingParams: TrackingParamFunction = (
  station,
  trackingParams,
) => {
  const newTrackingParams = pick<Tracking>(
    trackingParams,
    COMMON_LIVE_TRACKING_PARAM_KEYS,
  );
  newTrackingParams.callLetters = station.get('callLetters');
  newTrackingParams.devicename =
    getIsMobile(store.getState()) ? 'web-mobile' : 'web-desktop';
  if (station && station.id) newTrackingParams.stationid = station.id;
  // Adding dist value here which is static and required across all live stream types
  newTrackingParams.dist = 'iheart';

  const state = store.getState();
  const subType = getSubscriptionType(state);
  newTrackingParams.subscription_type = {
    [SUBSCRIPTION_TYPE.PREMIUM]: 'all_access',
    [SUBSCRIPTION_TYPE.PLUS]: 'plus',
    [SUBSCRIPTION_TYPE.FREE]: 'free',
    [SUBSCRIPTION_TYPE.NONE]: 'free',
  }[subType];

  return newTrackingParams;
};

export const getCommonAdswizzTrackingParams: TrackingParamFunction = (
  station,
  trackingInfo,
) => {
  const reportableTrackingParams = getPIICompliantTrackingParams(trackingInfo);
  const trackingParams = getCommonLiveTrackingParams(
    station,
    reportableTrackingParams,
  );

  return {
    ccaud: getAudienceData(),
    ...reportableTrackingParams,
    ...trackingParams,
    playedFrom: trackingInfo.playedFrom,
  };
};

export const getLiveAdswizzTrackingParams: TrackingParamFunction = (
  station,
  trackingInfo,
) => {
  const trackingParams = getCommonAdswizzTrackingParams(station, trackingInfo);
  const { ccaud, ...restTrackingParams } = trackingParams;

  // IHRWEB-15241: rename ccauds to `aw_0_1st.ccaud`
  if (Array.isArray(ccaud)) {
    restTrackingParams['aw_0_1st.ccaud'] = ccaud;
  } else if (ccaud) {
    restTrackingParams['aw_0_1st.ccaud'] = [ccaud];
  } else {
    restTrackingParams['aw_0_1st.ccaud'] = [];
  }

  return restTrackingParams;
};

/**
 * IHRWEB-15810 - 10/6/2020 - Joe Fensler
 * Need to send specific tracking parameters to Revma
 * as defined by the monetization team. Triton has 2 unique parameters
 * for Live stations that Adswizz does not currently use:
 * `country` (ISO 3166-1 alpha-2 two-letter country code (e.g. US)),
 * and `site-url` (Website for programmatic inventory verification (url encoded)).
 * As they are defined in https://docs.google.com/spreadsheets/d/1PNwyI-yTig9cns5PT2GQsBLVYkFJdqfOWrRlz2DbVEk/edit?usp=sharing.
 */
export const getLiveTritonTrackingParams: TrackingParamFunction = (
  station,
  trackingInfo,
) => {
  const piiCompliantrackingParams = getPIICompliantTrackingParams(trackingInfo);
  const trackingParams = getCommonLiveTrackingParams(
    station,
    piiCompliantrackingParams,
  );
  const state = store.getState();
  const countryCode = getCountryCode(state);
  const locale = getLocale(state);
  const pIds = getTritonPartnerIds(state);
  const { tritonSecureToken } = getTritonSecureTokenData(state);

  if (station.get('ads')?.enable_triton_token) {
    trackingParams.partnertok = tritonSecureToken;
  }
  trackingParams.country = countryCode;
  trackingParams.locale = locale;
  trackingParams['site-url'] = getCurrentUrl();

  // Add triton partner ids to query params
  Object.keys(pIds).forEach(key => {
    trackingParams[key] = pIds[<any>key];
  });

  return trackingParams;
};

export const getDefaultLiveTrackingParams: TrackingParamFunction = (
  station: Station,
  trackingInfo: Tracking,
) => {
  const piiCompliantrackingParams = getPIICompliantTrackingParams(trackingInfo);
  const trackingParams = getCommonLiveTrackingParams(
    station,
    piiCompliantrackingParams,
  );
  return trackingParams;
};

export const getLiveUrl = (
  streamUrl: string,
  station: Station,
  trackingInfo: Tracking,
): string => {
  switch (station.get('ads')?.audio_ad_provider) {
    case AUDIO_AD_PROVIDER.ADSWIZZ:
      return addParams(
        streamUrl,
        getLiveAdswizzTrackingParams(station, trackingInfo),
      );
    case AUDIO_AD_PROVIDER.TRITON:
    case null:
      return addParams(
        streamUrl,
        getLiveTritonTrackingParams(station, trackingInfo),
      );
    default:
      return addParams(
        streamUrl,
        getDefaultLiveTrackingParams(station, trackingInfo),
      );
  }
};

export function getPodcastUrl(streamUrl: string): string {
  let url = streamUrl;
  const state = store.getState();
  // IHRWEB-14922: for podcast producers to provide attribution to plays/downloads through iHeartRadio
  const search = getSearch(state);
  const adTargeting = getPodcastAdTargeting(state);
  const podcastTritonTokenEnabled = getPodcastTritonTokenEnabled(state);
  const { utm_medium = null } = search ? qs.parse(search.replace('?', '')) : {};
  url = utm_medium ? addParams(url, { utm_medium }) : url;

  const tritonToken = getTritonSecureTokenData(state);

  if (
    typeof adTargeting?.providerId === 'number' &&
    podcastTritonTokenEnabled
  ) {
    url = addParams(url, { partnertok: tritonToken.tritonSecureToken });
  }

  return url;
}

export const processStreamUrl = (
  streamUrl: string,
  trackingInfo: Tracking,
  station?: Station,
) => {
  if (!station) return streamUrl;

  switch (station.get('type')) {
    case STATION_TYPE.PODCAST:
      return getPodcastUrl(streamUrl);
    case STATION_TYPE.LIVE:
      return getLiveUrl(streamUrl, station, trackingInfo);
    default:
      return streamUrl;
  }
};
