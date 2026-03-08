import factory from 'state/factory';
import Logger, { CONTEXTS } from 'modules/Logger';
import transport from 'api/transport';
import { adsTargeting } from 'state/Ads/services';
import { getAmpUrl } from 'state/Config/selectors';
import { TargetingStationTypes } from 'ads/playback/constants';
import type { ResolvedStationData } from 'ads/playback/resolvers/resolveStationAdData';

const store = factory();

/**
 * A wrapper around the /targeting endpoint request which provides logging
 * and returns a safe fallback if the call fails
 */
const fetchCustomTargeting = async (
  stationInfo: ResolvedStationData,
): Promise<Record<string, any>> => {
  const { stationType, stationId, targetingType } = stationInfo;
  const ampUrl = getAmpUrl(store.getState());

  let targeting = {};
  const targetableTypes = Object.values(TargetingStationTypes) as Array<string>;

  if (!targetableTypes.includes(targetingType ?? stationType)) {
    return targeting;
  }

  try {
    ({ data: targeting } = await transport(
      adsTargeting({
        ampUrl,
        reportingKey: stationId,
        type: targetingType ?? stationType,
      }),
    ));
    Logger.info([CONTEXTS.PLAYBACK_ADS, 'fetchCustomTargeting'], {
      stationInfo,
      targeting,
    });
  } catch (e) {
    targeting = {};
    Logger.error([CONTEXTS.PLAYBACK_ADS, 'fetchCustomTargeting'], e);
  }

  return targeting;
};

export default fetchCustomTargeting;
