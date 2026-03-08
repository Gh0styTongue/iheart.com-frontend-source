import factory from 'state/factory';
import qs from 'qs';
import { getCountryCode, getHost, getTerminalId } from 'state/Config/selectors';
import {
  getCustomAdsType,
  getStationTargetingParams,
  getTritonAdsUrl,
  getTritonSecureTokenData,
} from 'state/Ads/selectors';
import { getIsMobile } from 'state/Environment/selectors';
import { getLocale } from 'state/i18n/selectors';
import { getSession } from 'state/Session/selectors';
import { getZipCode } from 'state/Profile/selectors';
import { isPrivacyOptOut } from 'trackers/privacyOptOut';
import { query as queryUtil } from 'utils/url';
import { SEED_TYPE, STATION_TYPE } from 'constants/stationTypes';
import { TargetingKeys } from 'ads/targeting/constants';
import { v4 as uuid } from 'uuid';
import type { CustomInStreamAdParams } from '../types';

const store = factory();

type Params = {
  sessionStart: boolean;
  station: NonNullable<CustomInStreamAdParams>;
};

export const getCurrentUrl = (): string => {
  if (!__CLIENT__ || !window) return 'unknown';
  const { protocol, hostname, pathname } = window.location;
  return `${protocol}//${hostname}${pathname}`;
};

/**
 * Constructs a Triton audio vast ad
 */
export default function getTritonVastAd({
  station,
  sessionStart,
}: Params): string | null {
  const state = store.getState();
  const tritonAdsUrl = getTritonAdsUrl(state);

  const adStation = station as any;

  if (!tritonAdsUrl) return null;

  const { profileId, sessionId } = getSession(state);

  const countryCode = getCountryCode(state);
  const host = getHost(state);
  const isMobile = getIsMobile(state);
  const privacyOptOut = isPrivacyOptOut(state);
  const terminalId = getTerminalId(state);
  const zipCode = getZipCode(state);
  const locale = getLocale(state);
  const adsTargeting = getStationTargetingParams(state);
  const { tritonSecureToken } = getTritonSecureTokenData(state);
  const isTriton = getCustomAdsType(state) === 'Triton';

  const playlisttype =
    adsTargeting?.[TargetingKeys.PLAYLISTTYPE] ??
    `seedtype_${adStation.get('seedType')}`;

  const playlistId =
    adStation.get('stationType') === STATION_TYPE.PLAYLIST_RADIO ?
      adsTargeting?.['aw_0_1st.playlistid']
    : adStation.get('seedId');

  const adGenre =
    adStation.get('seedType') === SEED_TYPE.FAVORITES ?
      adStation.get('adGenre')
    : adsTargeting?.[TargetingKeys.IHMGENRE];

  const query = queryUtil(window?.location?.href ?? '');

  const tritonParams = {
    scenario: query.noad ? 'vast-no-ad' : undefined,
    clientType: 'web',
    country: countryCode,
    deviceName: isMobile ? 'web-mobile' : 'web-desktop',
    dist: 'iheart',
    host,
    ihmgenre: adGenre,
    locale,
    modTime: Date.now(),
    partnertok: isTriton ? tritonSecureToken : undefined,
    playlistid: playlistId,
    playlisttype,
    postalcode: privacyOptOut ? null : zipCode,
    profileid: profileId,
    sessionid: sessionId,
    sessionstart: sessionStart,
    'site-url': getCurrentUrl(),
    streamid: adStation.get('id'),
    'break-id': uuid(),
    tags: adGenre,
    terminalid: terminalId,
    territory: countryCode,
    us_privacy: privacyOptOut ? '1-Y-' : '1-N-',
    'X-Device-Referer': document.referrer,
    'X-Device-User-Agent': window.navigator.userAgent,
  };

  return `${tritonAdsUrl}?${qs.stringify(tritonParams)}`;
}
