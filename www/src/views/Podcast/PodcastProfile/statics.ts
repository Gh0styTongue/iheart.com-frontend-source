import axios from 'axios';
import {
  buildEpisodeSuggestedDest,
  handlePodcastEpisodePathIncorrect,
  handlePodcastPathIncorrect,
} from 'views/Podcast/helpers';
import { Episode, PodcastProfileResponse } from 'state/Podcast/types';
import { extractClipSlugAndId } from 'utils/HighlightsUtils';
import {
  fetchAndSetPodcastHosts,
  getPodcastNews,
  getPodcastPopularCategories,
  requestPodcast,
  setHighlightsMetadata,
  setPodcastEpisodes,
  setPodcastProfile,
} from 'state/Podcast/actions';
import { fetchHighlightsMetadata } from 'api/highlights';
import { getAmpUrl, getWebGraphQlUrl } from 'state/Config/selectors';
import { getCredentials, getIsAnonymous } from 'state/Session/selectors';
import {
  getCurrentEpisodeId,
  getParams,
  getSection,
  getSlugId,
} from 'state/Routing/selectors';
import {
  getEpisode,
  getEpisodes,
  getPodcast,
  getPodcastTranscription,
} from 'state/Podcast/services';
import {
  getEpisodeTitle,
  getPopularCategoryPodcasts,
  getSeedId,
  getTitle,
} from 'state/Podcast/selectors';
import {
  getHighlightsSDKEnabled,
  getUseAmpTranscription,
} from '../../../state/Features/selectors';
import { getIdFromSlug } from 'state/Routing/helpers';
import { getPodcastUrl } from 'state/Podcast/helpers';
import { PAGE_TYPE } from 'constants/pageType';
import { removeHTML } from 'utils/string';
import { setForce404data } from 'state/Routing/actions';
import { setHasHero } from 'state/Hero/actions';
import { State } from 'state/buildInitialState';
import { STATION_TYPE } from 'constants/stationTypes';
import { Thunk } from 'state/types';

type RoutingStatus = {
  force404?: boolean;
  notFound?: boolean;
  redirectUrl?: string;
};

const default404Title = 'Podcast Directory';
const default404Url = '/podcast/';

/*
 * GET ASYNC DATA
 */
export function getAsyncData(): Thunk<Promise<RoutingStatus | undefined>> {
  return async function thunk(dispatch, getState, { logger, transport }) {
    const state = getState();

    const ampUrl = getAmpUrl(state);
    const { profileId, sessionId } = getCredentials(state);
    const isAnonymous = getIsAnonymous(state);
    const useAmpTranscription = getUseAmpTranscription(state);

    const {
      slugifiedId: podcastSlug,
      episodeSlug,
      highlightsSlug,
    } = getParams(state);
    const podcastId = getIdFromSlug(podcastSlug) || getSlugId(state);
    const episodeId = getCurrentEpisodeId(state) || getIdFromSlug(episodeSlug);
    const slugIsIncomplete = podcastSlug ? !podcastId : false;
    const episodeSlugIsIncomplete = episodeSlug ? !episodeId : false;
    const isEpisodePage = !!(episodeSlug || episodeId);
    const isEpisodesDir = getSection(state) === 'episodes';

    const serviceOpts = { ampUrl, logger, profileId, sessionId, transport };
    let episodeTranscription: string | undefined;

    const force404AndSuggestDestination = (
      title?: string | null,
      url?: string | null,
    ) => {
      dispatch(
        setForce404data({
          suggestedTitle: title || default404Title,
          suggestedUrl: url || default404Url,
        }),
      );
      return { notFound: true, force404: true };
    };

    let episodeIds: Array<Episode['id']> = [];
    let episodes: Array<Episode> = [];

    const isHighlightsEnabled = getHighlightsSDKEnabled(state);

    // If highlights slug is provided but SDK is disabled, return 404
    if (highlightsSlug && !isHighlightsEnabled) {
      return { notFound: true };
    }

    // check that paths are quality and that episode matches podcast
    // if not, 404 & suggest destination
    if (isEpisodePage) {
      // 404 & Suggest slugified version IHRWEB-17063 mp
      if (slugIsIncomplete || episodeSlugIsIncomplete) {
        const { suggestedTitle, suggestedUrl } =
          await handlePodcastEpisodePathIncorrect(
            episodeId || episodeSlug,
            podcastId || podcastSlug,
            serviceOpts,
          );
        return force404AndSuggestDestination(suggestedTitle, suggestedUrl);
      }

      let episodeData;

      if (episodeId) {
        try {
          const episodeRequest = getEpisode(
            episodeId,
            ampUrl,
            profileId,
            sessionId,
          );
          episodeData = await transport(episodeRequest);
        } catch (error) {
          const { suggestedTitle, suggestedUrl } =
            await handlePodcastPathIncorrect(podcastId, serviceOpts);
          return force404AndSuggestDestination(suggestedTitle, suggestedUrl);
        }
      }

      const { episode } = episodeData?.data ?? ({} as Episode);

      if (
        episode.transcriptionAvailable &&
        episode?.transcription?.transcriptionLocation &&
        episodeId
      ) {
        try {
          // Feature flag to determine if we fetch transcription from AMP
          if (useAmpTranscription) {
            episodeTranscription = await axios
              .get(String(episode?.transcription?.transcriptionLocation))
              .then(response => response.data);

            episodeTranscription =
              episodeTranscription && removeHTML(episodeTranscription).trim();
          } else {
            // If no feature flag, fetch transcription from webAPI
            const graphQLUrl = getWebGraphQlUrl(state);
            const random = await transport(
              getPodcastTranscription({
                baseUrl: graphQLUrl,
                episodeId,
              }),
            );

            episodeTranscription =
              random.data.data.podcastTranscriptionFormatter.format;
          }
        } catch {
          episodeTranscription = undefined;
        }
      }

      episodes = [{ ...episode, episodeTranscription }];
      episodeIds = [episode?.id];

      if (episode?.podcastId !== podcastId) {
        // AV - 11/13/18 - WEB-12578 this episode doesn't belong to the podcast in the url.  404!
        // also IHRWEB-17063 suggest correct destination in 404 mp
        // we have episode info already, so use podcast path helper so we don't do episode service call again
        const { suggestedTitle: workingTitle, suggestedUrl: workingUrl } =
          await handlePodcastPathIncorrect(episode?.podcastId, serviceOpts);
        const { suggestedTitle, suggestedUrl } = buildEpisodeSuggestedDest(
          workingTitle,
          workingUrl,
          episode?.id,
          episode?.title,
        );
        return force404AndSuggestDestination(suggestedTitle, suggestedUrl);
      }
    } else if (slugIsIncomplete || isEpisodesDir) {
      // !isEpisodePage: FOR PODCAST PROFILE PAGE or old outdated /episodes/ path
      const { suggestedTitle, suggestedUrl } = await handlePodcastPathIncorrect(
        podcastId || podcastSlug,
        serviceOpts,
      );
      return force404AndSuggestDestination(suggestedTitle, suggestedUrl);
    }

    // checks done, now set podcast data, episodesData, and social connect
    let podcastData: PodcastProfileResponse;

    try {
      podcastData = await transport(getPodcast(podcastId, ampUrl)).then(
        ({ data = {} }) => data,
      );
    } catch (error) {
      // there's no podcast here, we should 404
      return force404AndSuggestDestination(default404Title, default404Url);
    }

    const {
      articles,
      customLinks,
      description,
      editorialContentQuery,
      hostIds,
      id,
      imageUrl,
      showType,
      slug,
      socialMediaLinks,
      title,
      adTargeting,
    } = podcastData;

    if (!isEpisodePage) {
      const sortBy = showType === 'serial' ? 'startDate-asc' : 'startDate-desc';

      const episodesPromise =
        __CLIENT__ ?
          Promise.resolve({ data: [] })
        : transport(
            getEpisodes({
              ampUrl,
              id: podcastId,
              limit: 20,
              profileId,
              sessionId,
              sortBy,
              isAnonymous,
            }),
          ).then(({ data }) => data);

      const episodesData: { data: Array<Episode> } = await episodesPromise;

      episodes = episodesData?.data ?? [];
      episodeIds = episodes.reduce(
        (ids, { id: reducedEpisodeId }) => [...ids, reducedEpisodeId],
        [] as Array<number>,
      );
    }

    // only call for popular podcasts when we don't have them
    // IHRWEB #15945 - this action is causing the main podcast data
    // to be overwritten with some incorrect attributes. For this reason this
    // action has been moved to happen first. This is due to some radioedit data
    // that needs to be updated. Ticket #16417 for that update has been created
    const popularCategoryPodcasts = getPopularCategoryPodcasts(state);
    if (popularCategoryPodcasts.length === 0) {
      await dispatch(getPodcastPopularCategories());
    }

    // Fetch highlights metadata for highlights page (server-side for SEO)
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
        // Silently fail - will fallback to podcast metadata
        logger.warn('Failed to fetch highlights metadata', { highlightsSlug });
      }
    } else {
      // Clear highlights metadata when not on highlights page
      dispatch(setHighlightsMetadata(null));
    }

    // Fetch video map status for the podcast (server-side) only if highlights SDK is enabled

    const promises = [
      dispatch(
        setPodcastProfile({
          articles,
          customLinks,
          description,
          editorialContentQuery,
          episodeIds,
          hostIds,
          imageUrl,
          seedId: id,
          seedType: STATION_TYPE.PODCAST,
          showType,
          slug,
          socialMediaLinks,
          title,
          adTargeting,
          url: getPodcastUrl(id, slug),
        }),
      ),
      dispatch(setPodcastEpisodes(episodes)),
      dispatch(fetchAndSetPodcastHosts()),
      dispatch(setHasHero(true)),
      // We want to make sure the podcast has been fetched before we get the associated news.
      await dispatch(requestPodcast(id)),
      dispatch(getPodcastNews(podcastId)),
    ];
    await Promise.all(promises);
    return undefined;
  };
}

export function pageInfo(state: State) {
  const pageId = getSeedId(state);
  const title = getTitle(state);

  if (getCurrentEpisodeId(state)) {
    return {
      episodeId: getCurrentEpisodeId(state),
      episodeTitle: getEpisodeTitle(state),
      pageId,
      pageType: PAGE_TYPE.EPISODE,
      title,
      targeting: {
        name: 'talkshow',
        modelId: `s${pageId}`,
      },
    };
  }
  return {
    pageId,
    pageType: PAGE_TYPE.SHOW,
    title,
    targeting: {
      name: pageId ? 'talkshow' : 'directory:show',
      modelId: pageId ? `s${pageId}` : 'directory:show:home',
    },
  };
}
