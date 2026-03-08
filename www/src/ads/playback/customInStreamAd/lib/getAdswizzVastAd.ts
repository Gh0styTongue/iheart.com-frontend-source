import factory from 'state/factory';
import qs from 'qs';
import { getCommonAdswizzTrackingParams } from 'web-player/utils/streamUrl';
import {
  getCompanionZones,
  getSubdomain,
  getZoneId,
} from 'state/Ads/selectors';
import { getTargeting } from 'state/Targeting';
import { STATION_TYPE } from 'constants/stationTypes';
import type { CustomInStreamAdParams } from '../types';
import type { Station } from 'web-player/PlayerState';

const store = factory();

const defaultAdswizzParams = {
  protocolVersion: '2.0-compliant',
  reqType: 'AdsSetup',
  seedGenre: '',
  seedId: '',
  seedTypeId: '',
};

type Params = {
  customSessionId: string;
  sessionStart: boolean;
  station: NonNullable<CustomInStreamAdParams>;
};

const adswizzUrl = (adswizzSubdomain: string, params: Record<string, any>) =>
  `https://${adswizzSubdomain}.deliveryengine.adswizz.com/www/delivery/swfIndex.php?${qs.stringify(
    params,
  )}`;

export default function getAdswizzVastAd({
  customSessionId,
  sessionStart,
  station,
}: Params): null | string {
  const state = store.getState();
  const { globalTargeting } = getTargeting(state);
  const adswizzParams = getCommonAdswizzTrackingParams(
    station as Station,
    globalTargeting,
  );
  const adswizzSubdomain = getSubdomain(state);
  const companionZones = getCompanionZones(state);
  const zoneId = getZoneId(state);

  const adStation = station as any;
  const seedId = adStation.get('seedId');
  const seedType = adStation.get('seedType');

  const params = {
    ...defaultAdswizzParams,
    companionZones,
    zoneId,
    ...(seedType === STATION_TYPE.FAVORITES ?
      {
        genre: adStation.get('adGenre'),
        seedTypeId: `seedtype_${seedType}`,
      }
    : (adStation.get('targetingParams') ?? {})),
    ...adswizzParams,
  };

  // rename params to adswizz counterparts
  const { seedTypeId, genre, ccaud, companionAds, ...restParams } = params;

  const ccaudParams = { 'aw_0_1st.ccaud': ccaud };

  const formattedParams = {
    'aw_0_1st.companionType': '["IFRAME", "STATIC"]',
    'aw_0_1st.ihmgenre': genre,
    'aw_0_1st.playlistid': seedId,
    'aw_0_1st.playlisttype': seedTypeId,
    'aw_0_1st.sessionid': customSessionId,
    'aw_0_1st.sessionstart': sessionStart,
    companionAds,
    ...restParams,
  };

  let url = adswizzUrl(adswizzSubdomain, {
    ...formattedParams,
    ...ccaudParams,
  });

  if (url.length > 4095) {
    url = adswizzUrl(adswizzSubdomain, formattedParams);
  }

  return url;
}
