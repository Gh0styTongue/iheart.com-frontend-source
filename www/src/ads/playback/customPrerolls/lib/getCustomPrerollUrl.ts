import factory from 'state/factory';
import fetchCustomPrerollUrl from './fetchCustomPrerollUrl';
import fetchCustomTargeting from './fetchCustomTargeting';
import Logger, { CONTEXTS } from 'modules/Logger';
import qs from 'qs';
import replaceAmpTags from './replaceAmpTags';
import resolveStation from 'state/Player/resolvers';
import { getDFPId, getTFCDAgeLimitApplies } from 'state/Ads/selectors';
import { getPageInfo } from 'state/Routing/selectors';
import { getTargeting } from 'state/Targeting';
import { isPrivacyOptOut } from 'trackers/privacyOptOut';

import countryCodes from 'constants/countryCodes';
import { fetchAmazonBids } from 'ads/headerBidding/amazon';
import { getCountryCode } from 'state/Config/selectors';
import { getPermutiveSegments } from 'vendor/permutive';
import { resolveStationAdData } from 'ads/playback/resolvers';
import type { CustomPrerollParams } from 'ads/playback/customPrerolls/types';

const store = factory();

/**
 * The v2 ads process is super hacky. We request an ad url from AMP which may return a url. If it does,
 * the url will have several {AMP_PROPERTY} substrings which will need to be replaced with proper values before
 * attempting to play the ad.
 */
const getCustomPrerollUrl = async (
  stationParams: CustomPrerollParams,
): Promise<string | null> => {
  let url: string | null = null;
  let stationTargeting: Record<string, any> = {};
  let stationData: ReturnType<typeof resolveStationAdData> = null;

  try {
    const stationObj = await resolveStation({
      ...stationParams,
      partialLoad: false,
    });
    stationData = resolveStationAdData(
      stationObj as Parameters<typeof resolveStationAdData>[0],
    );
  } catch (e) {
    Logger.error([CONTEXTS.PLAYBACK_ADS, 'resolveStation'], e);
    stationData = null;
  }

  if (!stationData) return null;

  [url, stationTargeting] = await Promise.all([
    fetchCustomPrerollUrl({
      playedFrom: stationParams.playedFrom as number,
      ...stationData,
    }),
    fetchCustomTargeting(stationData),
  ]);

  if (!url) return null;

  const state = store.getState();
  const { globalTargeting, playerTargeting } = getTargeting(state);
  const pageInfo = getPageInfo(state);
  const tfcdApplies = getTFCDAgeLimitApplies(state);
  const ccpaApplies = isPrivacyOptOut(state);
  const adId = getDFPId(state);
  const countryCode = getCountryCode(state);

  const params = {
    AMP_SZ: '640x480',
    AMP_IU: `/${adId}/ccr.ihr/ihr`,
  };

  // First parse the query string, and separate the vast params & cust_params (which is a child qs)
  const [baseUrl, query] = url.split('?');
  const { cust_params: unparsedCustomParams, ...unformattedVastParams } =
    qs.parse(query);

  // Replace AMP tags in query with proper param values
  const vastParams = {
    ...replaceAmpTags(unformattedVastParams, params),
    url: window.location.href,
  };

  // Now we build out the custParams obj
  const custParamsObj = qs.parse(decodeURIComponent(unparsedCustomParams));
  if (custParamsObj.seed === '-1' && stationData.stationType === 'COLLECTION') {
    const [, seedId] = (stationData.stationId as string).split('::');
    custParamsObj.seed = seedId;
  }

  // IHRWEB-16687 - likely a bug, but it doesn't appear any pages have a pageType of 'news'
  let pageParams = {};
  if (pageInfo?.pageType === 'news') {
    pageParams = {
      artistid: pageInfo.artist_id,
      campaign: pageInfo.adCampaign,
      ccrmarket: playerTargeting.ccrmarket,
      contentcategory: pageInfo.targeting?.contentcategory,
      contentdetail: pageInfo.targeting?.contentdetail,
      contenttype: 'articles',
    };
  }

  const { age, gender, env, zip } = globalTargeting;

  const permutiveSegments =
    countryCode === countryCodes.CA ? await getPermutiveSegments() : undefined;
  const apsTargeting = await fetchAmazonBids('preroll', [[640, 480]], 'video');

  const custParams = {
    // Per monetization, even though we do not have values for these AMP tags,
    // send 'null' in their place
    ...replaceAmpTags(custParamsObj, {
      AMP_CCRCONTENT1: 'null',
      AMP_CCRCONTENT2: 'null',
      AMP_CCRCONTENT3: 'null',
      AMP_SOURCE: 'null',
    }),
    ...stationTargeting,
    ...pageParams,
    a: ccpaApplies ? null : age,
    env,
    g: ccpaApplies ? null : gender,
    locale: playerTargeting.locale,
    rzip: ccpaApplies ? null : zip,
    ccrpos: 7005, // THIS OVERWRITES THE CCRPOS THAT AMP GIVES US AND IS INTENDED TO BE TEMPORARY
    ...(permutiveSegments ? { permutive: permutiveSegments } : {}),
  };

  const parsedAPSTargeting =
    typeof apsTargeting === 'string' ? String(apsTargeting) : undefined;
  const queryStr = qs.stringify({
    tfcd: tfcdApplies ? 1 : 0,
    rdp: ccpaApplies ? 1 : 0,
    description_url: encodeURIComponent(window.location.href),
    ...vastParams,
    cust_params: qs.stringify(custParams) + parsedAPSTargeting,
  });

  return `${baseUrl}?${queryStr}`;
};

export default getCustomPrerollUrl;
