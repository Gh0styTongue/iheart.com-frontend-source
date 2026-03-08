import optimisticIdiotLookup from 'utils/hacks/optimisticIdiotLookup';
import { buildUrl } from 'utils/mediaServerImageMaker/mediaServerImageUrl';
import { CONTEXTS } from 'modules/Logger';
import { extractClipSlugAndId } from 'utils/HighlightsUtils';
import { fetchHighlightsMetadata } from 'api/highlights';
import { fetchStationVideoMapStatus } from 'api/videoMapStatus';
import {
  getAds,
  getCallLetters,
  getFormat,
  getMarkets,
  getSeedId,
} from 'state/Live/selectors';
import {
  getAmpUrl,
  getCountryCode,
  getMediaServerUrl,
  getSiteUrl,
  getSupportedCountries,
  getWebGraphQlUrl,
} from 'state/Config/selectors';
import { getHighlightsSDKEnabled } from 'state/Features/selectors';
import { getLiveStationById, profileGraphQl } from 'state/Live/services';
import { getLocale } from 'state/i18n/selectors';
import { getParams, getSlugId } from 'state/Routing/selectors';
import {
  getSimilarLiveStations,
  receiveStations,
  setHighlightsMetadata,
  setRELiveProfile,
} from 'state/Live/actions';
import { LiveProfileResponse, Show } from 'state/Live/types';
import { PAGE_TYPE } from 'constants/pageType';
import { parseProfileGraphQlData } from 'state/Live/helpers';
import { requestRelatedPlaylists } from 'state/Playlist/actions';
import { requestRelatedPodcasts } from 'state/Podcast/actions';
import { setHeroPremiumBackground } from 'state/Hero/actions';
import { State } from 'state/buildInitialState';
import { STATION_TYPE } from 'constants/stationTypes';
import type { GetAsyncData } from 'state/types';

export const getAsyncData: GetAsyncData = () => {
  return async function thunk(dispatch, getState, { logger, transport }) {
    const state = getState();
    const ampUrl = getAmpUrl(state);
    const countryCode = getCountryCode(state);
    const supportedCountries = getSupportedCountries(state);
    const siteUrl = getSiteUrl(state);
    const id = getSlugId(state);
    const { highlightsSlug } = getParams(state);
    const isHighlightsEnabled = getHighlightsSDKEnabled(state);

    // If highlights slug is provided but SDK is disabled, return 404
    if (highlightsSlug && !isHighlightsEnabled) {
      return { notFound: true };
    }

    if (Number.isNaN(parseInt(id, 10))) {
      const errObj = new Error(`invalid id: ${id}`);
      logger.error(
        [CONTEXTS.ROUTER, CONTEXTS.LIVE],
        errObj.message,
        {},
        errObj,
      );
      return { notFound: true };
    }

    let liveStation;

    try {
      liveStation = await transport(getLiveStationById({ ampUrl, id }));
    } catch (e: any) {
      const errObj =
        e instanceof Error ? e : (
          new Error(e?.statusText ?? 'error getting live station')
        );
      logger.error(
        [CONTEXTS.ROUTER, CONTEXTS.LIVE],
        errObj.message,
        {},
        errObj,
      );
      const { response = {} } = e;
      const { status } = response;

      if (status === 404) {
        if (!__CLIENT__) {
          const countryCodes = supportedCountries.filter(
            code => code !== countryCode,
          );
          liveStation = await optimisticIdiotLookup(
            id,
            countryCodes,
            getState(),
          );
        } else {
          return { notFound: true };
        }
      } else {
        throw errObj;
      }
    }

    let profileData = {} as LiveProfileResponse;
    const stationData = liveStation?.data?.hits?.[0] ?? {};
    try {
      const { callLetters } = stationData;
      ({ data: profileData } = await transport(
        profileGraphQl({
          locale: getLocale(state),
          slug: callLetters.toLowerCase(),
          url: getWebGraphQlUrl(state),
        }),
      ));
    } catch (e: any) {
      const errObj = new Error(
        e?.statusText ?? 'error getting Live Profile data',
      );
      logger.error(
        [CONTEXTS.ROUTER, CONTEXTS.LIVE],
        errObj.message,
        {},
        errObj,
      );
    }

    const relatedPodcastIds =
      profileData?.data?.sites?.find?.config?.podcasts?.general
        ?.default_podcasts ?? [];

    const relatedPlaylistIds =
      profileData?.data?.sites?.find?.config?.playlists?.general
        ?.default_playlists ?? [];

    const { seedId, id: stationId, website: stationSite } = stationData;
    const {
      upcoming = [],
      current,
      hero,
      leads,
      timeline,
      social,
      timeUntilShiftChange,
      legalLinks,
    } = parseProfileGraphQlData(
      profileData,
      // relative links on siteManager need to resolve to the station's
      { siteUrl, stationSite },
    );

    const { image, background } = hero;
    const primaryBackground =
      image ?
        buildUrl(
          { mediaServerUrl: getMediaServerUrl(state), siteUrl },
          image,
        )(buildUrl as any)
      : '';

    // Fetch clip metadata for highlights page (server-side for SEO)
    if (highlightsSlug) {
      try {
        const { clipId } = extractClipSlugAndId(highlightsSlug);
        if (clipId) {
          const highlightsMetadata = await fetchHighlightsMetadata({
            clipId,
            state,
          });
          if (highlightsMetadata && !highlightsMetadata.error) {
            dispatch(setHighlightsMetadata(highlightsMetadata));
          }
        }
      } catch (error) {
        // Silently fail - will fallback to station metadata
        logger.warn('Failed to fetch clip metadata', { highlightsSlug });
      }
    } else {
      // Clear clip metadata when not on highlights page
      dispatch(setHighlightsMetadata(null));
    }

    // Fetch video map status for the station (server-side) only if highlights SDK is enabled

    await Promise.all([
      dispatch(requestRelatedPodcasts(relatedPodcastIds)),
      dispatch(requestRelatedPlaylists(relatedPlaylistIds)),
      dispatch(receiveStations([stationData])),
      dispatch(
        setRELiveProfile(seedId || stationId, {
          current: { ...current, timeUntilShiftChange } as Show,
          leads,
          relatedPodcastIds,
          relatedPlaylistIds,
          social,
          timeline,
          upcoming,
          legalLinks,
        }),
      ),
      dispatch(setHeroPremiumBackground(String(primaryBackground), background)),
      dispatch(getSimilarLiveStations(stationId)),
    ]);
    return undefined;
  };
};

export function pageInfo(state: State) {
  const pageId = getSeedId(state);
  const model = {
    format: getFormat(state),
    markets: getMarkets(state),
  };

  return {
    ads: getAds(state),
    callLetters: getCallLetters(state),
    model,
    pageId,
    pageType: PAGE_TYPE.LIVE,
    stationType: STATION_TYPE.LIVE,
    targeting: {
      name: 'live',
      modelId: String(pageId),
      format: model.format,
      pageformat: model.format,
      market: model.markets[0]?.name,
      pagemarket: model.markets[0]?.name,
    },
  };
}
