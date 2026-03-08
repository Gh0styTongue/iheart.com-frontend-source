import factory from 'state/factory';
import Logger, { CONTEXTS } from 'modules/Logger';
import qs from 'qs';
import transport from 'api/transport';
import { getAmpUrl, getHost } from 'state/Config/selectors';
import { getSession } from 'state/Session/selectors';
import { postAds } from 'state/Player/services';
import { setTFCDAge } from 'state/Ads/actions';
import type { ResolvedStationData } from 'ads/playback/resolvers/resolveStationAdData';

const store = factory();

type PostAdsResponse = {
  data: {
    ads: Array<{
      url: string;
      preRoll: boolean;
    }>;
    ageLimit?: number;
  };
};

/**
 * This is a temporary workaround to allow us to force a preroll for non-live stations as our current flow relies on AMP providing the url, and they only return a URL when certain
 * criteria are met (such as if the user is new / has had an ad recently)
 * Exported only for testing
 */
export const getForcedUrl = () =>
  `https://pubads.g.doubleclick.net/gampad/ads?sz={AMP_SZ}&iu={AMP_IU}&ciu_szs={AMP_CIU_SZS}&cust_params=seed%3D30779802%26format%3DCHRPOP%26playedFrom%3D0%26country%3DUS%26genre%3Dartist%26grp%3Dcc%26ccrcontent1%3D{AMP_CCRCONTENT1}%26ccrcontent2%3D{AMP_CCRCONTENT2}%26ccrcontent3%3D{AMP_CCRCONTENT3}%26ccrpos%3D8000%26g%3Dgender.male%26a%3D23%26rzip%3D37210%26at%3DIHR%26id%3D1472149176%26ts%3D1613756191065%26source%3D{AMP_SOURCE}&impl=s&gdfp_req=1&env=vp&output=vast&unviewed_position_start=1&url=referrer_url&correlator=${Date.now()}`;

/**
 * Makes a request to the /ads endpoint. This flow is not ideal b/c we have no control over when an ad will play (which gives us abysmal testing)
 * and the URL it can return is a mess. It would be ideal if we could receive ad parameters from the /targeting endpoint instead so that we could build a url ourselves
 */
const fetchCustomPrerollUrl = async ({
  playedFrom,
  stationType,
  streamId: stationId,
}: {
  playedFrom: number;
} & ResolvedStationData): Promise<string | null> => {
  const ampUrl = getAmpUrl(store.getState());
  const host = getHost(store.getState());
  const { profileId, sessionId } = getSession(store.getState());

  if (!(stationType || stationId)) return null;

  let data: PostAdsResponse['data'];

  try {
    ({ data } = ((await transport(
      postAds({
        ampUrl,
        host,
        profileId: profileId!,
        sessionId: sessionId!,
        stationId,
        stationType,
        playedFrom: Number(playedFrom),
      }),
    )) ?? {}) as PostAdsResponse);
    await store.dispatch(setTFCDAge(data.ageLimit));
    Logger.info([CONTEXTS.PLAYBACK_ADS, 'fetchCustomPrerollUrl'], data);
  } catch (e) {
    data = { ads: [] };

    Logger.error([CONTEXTS.PLAYBACK_ADS, 'fetchCustomPrerollUrl'], e);
  }

  const { url, preRoll } = data?.ads?.[0] ?? {};

  // TEMP to facilitate testing
  const { forcePreroll } = qs.parse(window.location.search.slice(1));
  if (!url && forcePreroll) return getForcedUrl();

  if (!(url || preRoll)) return null;

  return url;
};

export default fetchCustomPrerollUrl;
