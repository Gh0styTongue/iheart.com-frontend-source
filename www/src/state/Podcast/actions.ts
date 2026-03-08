import { Action, Thunk } from 'state/types';
import {
  Category,
  Episode,
  GraphQLHostsResponse,
  Host,
  Network,
  Podcast,
  PodcastArticle,
  PodcastArticleResponse,
  PodcastProfile,
} from 'state/Podcast/types';
import { CONTEXTS } from 'modules/Logger';
import { E } from 'shared/utils/Hub';
import { Events } from 'modules/Analytics';
import { get, isEqual, isObject } from 'lodash-es';
import {
  getAmpUrl,
  getCountryCode,
  getWebGraphQlUrl,
} from 'state/Config/selectors';
import {
  getCategories,
  getCategory,
  getEpisode,
  getEpisodes,
  getFeaturedCategory,
  getFollowed,
  getNetworks,
  getPodcast,
  getPodcastData,
  getPodcastHosts,
  getPodcastRecs as getPodcastRecsWithAuth,
  getPopularCategory,
  setEpisodeProgress,
  setFollowed,
} from 'state/Podcast/services';
import {
  getCredentials,
  getIsAnonymous,
  getIsAuthenticated,
} from 'state/Session/selectors';
import {
  getCurrentlyPlayingEpisodeDuration,
  getFollowedBySeedId,
  getHostIds as getPodcastHostIds,
  getPodcastHosts as getPodcastHostsSelector,
  getPodcasts as getPodcastsSelector,
  getReceivedFollowed,
  getTitleBySeedId,
} from 'state/Podcast/selectors';
import { getFollowAnalyticsData } from 'modules/Analytics/legacyHelpers';
import { getLocale } from 'state/i18n/selectors';
import { getSearch } from 'state/SearchNew/selectors';
import { getTranslateFunction } from 'state/i18n/helpers';
import { mapCategoryLeads, mapPodcastLeads } from 'state/Podcast/helpers';
import {
  PODCAST_ARTICLES_LOADED,
  PODCAST_FEATURED_CATEGORY_ID,
  PODCAST_POPULAR_CATEGORY_ID,
  RECEIVED_FOLLOWED,
  RECEIVED_NETWORKS,
  RECEIVED_PODCAST_CATEGORIES,
  RECEIVED_PODCAST_CATEGORY,
  RECEIVED_PODCASTS,
  REORDER_PODCAST_EPISODES,
  SET_HIGHLIGHTS_METADATA,
  SET_IS_FOLLOWED,
  SET_PODCAST_CATEGORY_IDS,
  SET_PODCAST_EPISODE_PLAY_PROGRESS,
  SET_PODCAST_EPISODES,
  SET_PODCAST_HOSTS,
  SET_PODCAST_PROFILE,
  SET_VIDEO_MAP_STATUS,
} from './constants';
import { PODCAST_RECS_CATEGORY_ID } from 'state/Recs/constants';
import { Rec } from 'state/Recs/types';
import { recsReceived } from 'state/Recs/actions';
import { STATION_TYPE } from 'constants/stationTypes';
import type { HighlightsMetadata } from 'api/highlights';

export function setPodcastProfile(
  podcastProfile:
    | PodcastProfile
    | Pick<
        PodcastProfile,
        | 'adTargeting'
        | 'description'
        | 'episodeIds'
        | 'seedId'
        | 'seedType'
        | 'slug'
        | 'title'
        | 'url'
      >,
) {
  return {
    payload: podcastProfile,
    type: SET_PODCAST_PROFILE,
  };
}

export function setPodcastHosts(hosts: { [hostId: string]: Host }) {
  return {
    payload: hosts,
    type: SET_PODCAST_HOSTS,
  };
}

export function setHighlightsMetadata(metadata: HighlightsMetadata | null) {
  return {
    payload: metadata,
    type: SET_HIGHLIGHTS_METADATA,
  };
}

export function fetchAndSetPodcastHosts(): Thunk<
  Promise<ReturnType<typeof setPodcastHosts> | null>
> {
  return async (dispatch, getState, { transport }) => {
    const state = getState();
    const storedHosts = getPodcastHostsSelector(state);
    const hostIds = getPodcastHostIds(state);

    if (
      !isEqual(
        storedHosts.map(storedHost => storedHost.hostId),
        hostIds,
      ) &&
      hostIds.length
    ) {
      try {
        const response: GraphQLHostsResponse = await transport(
          getPodcastHosts(getWebGraphQlUrl(state), hostIds),
        );

        const hosts = Object.values(response.data.data.hosts)
          .filter(hostData => isObject(hostData))
          .map(hostData => ({
            ...hostData.summary,
            link: get(hostData, 'payload.fields.link.value'),
          }));

        const hostsMap: Record<string, Host> = {};

        // We are relying on the fact that the responses come in the same order as the hostIds we provide
        hosts.forEach((host, index) => {
          hostsMap[hostIds[index]] = host;
        });

        return dispatch(setPodcastHosts(hostsMap));
      } catch (e) {
        // we've logged the error in the transport layer
      }
    }

    return null;
  };
}

export function setPodcastEpisodes(episodes: Array<Episode>) {
  return {
    payload: episodes,
    type: SET_PODCAST_EPISODES,
  };
}

export function reorderPodcastEpisodes({
  episodes,
  seedId,
}: {
  episodes: Array<Episode>;
  seedId: number;
}) {
  return {
    payload: { episodes, seedId },
    type: REORDER_PODCAST_EPISODES,
  };
}

export const podcastArticlesLoaded = (
  articles: Array<PodcastArticle>,
  podcastSlugId: string | number,
) => ({
  payload: { articles, podcastSlugId },
  type: PODCAST_ARTICLES_LOADED,
});

export function setIsFollowed({
  seedId,
  followed,
  title,
  queryId,
  view,
}: {
  followed: boolean;
  seedId: number | string;
  title: string;
  queryId?: string;
  view?: { pageName: string; tab?: string };
}) {
  return {
    meta: {
      analytics: {
        data: getFollowAnalyticsData({
          followed,
          id: seedId,
          name: title,
          prefix: 'podcast',
          queryId,
          view,
        }),
        event: Events.FollowUnfollow,
      },
      deferHub: true,
      hub: [{ event: E.FAVORITE_CHANGE }],
    },
    payload: { followed, podcastId: seedId },
    type: SET_IS_FOLLOWED,
  };
}

export function updateFollowed({
  followed,
  seedId,
  view,
}: {
  followed: boolean;
  seedId: string | number;
  view?: { pageName: string; tab?: string };
}): Thunk<Promise<void>> {
  return (dispatch, getState, { transport }) => {
    const state = getState();
    const title = getTitleBySeedId(state, { seedId });
    const { profileId, sessionId } = getCredentials(state);
    const ampUrl = getAmpUrl(state);
    const { queryId } = getSearch(state);

    return transport(
      setFollowed({
        ampUrl,
        followed,
        profileId: profileId!,
        seedId,
        sessionId: sessionId!,
      }),
    ).then(() => {
      dispatch(setIsFollowed({ followed, seedId, title, queryId, view }));
    });
  };
}

export function toggleFollowed(seedId: number | string): Thunk<Promise<void>> {
  return (dispatch, getState) => {
    const isFollowed = getFollowedBySeedId(getState(), { seedId });
    return dispatch(updateFollowed({ followed: !isFollowed, seedId }));
  };
}

export function setPodcastCategoryIds(ids: Array<number>) {
  return {
    payload: ids,
    type: SET_PODCAST_CATEGORY_IDS,
  };
}

export function receivedPodcastCategory(
  name: string,
  id: string | number,
  podcasts: Array<{
    description: string;
    id: string | number | undefined;
    slug: any;
    title: string;
  }>,
) {
  return {
    payload: { id, name, podcasts },
    type: RECEIVED_PODCAST_CATEGORY,
  };
}

export function receivedPodcasts(
  podcasts: Array<{
    description: string;
    id: string | number | undefined;
    slug: any;
    title: string;
  }>,
) {
  return {
    payload: { podcasts },
    type: RECEIVED_PODCASTS,
  };
}

export function receivedPodcastCategories(categories: Array<Category>) {
  return {
    payload: { categories },
    type: RECEIVED_PODCAST_CATEGORIES,
  };
}

export function receivedPodcastPlayProgressData(
  position: number,
  episodeId: number,
  completed: boolean,
) {
  return {
    payload: { completed, episodeId, position },
    type: SET_PODCAST_EPISODE_PLAY_PROGRESS,
  };
}

export function receivedFollowed({
  nextPageKey,
  podcasts,
}: {
  nextPageKey: string | null | undefined;
  podcasts: Array<Podcast>;
}): Action<{
  nextPageKey: string | null | undefined;
  podcasts: Array<Podcast>;
}> {
  return {
    payload: {
      nextPageKey,
      podcasts: podcasts.map(p => ({
        ...p,
        followed: true,
      })),
    },
    type: RECEIVED_FOLLOWED,
  };
}

export function requestRelatedPodcasts(
  relatedPodcastIds: Array<string>,
): Thunk<Promise<void>> {
  return async (dispatch, getState, { logger, transport }) => {
    if (!relatedPodcastIds) return;
    const state = getState();
    const ampUrl = getAmpUrl(state);
    const relatedPodcastData = await Promise.all(
      relatedPodcastIds
        .filter(podcastId => !getPodcastsSelector(state)[podcastId])
        .map(async podcastId => {
          let podcast = {};
          try {
            podcast = await transport(getPodcast(podcastId, ampUrl));
          } catch (e: any) {
            const errObj =
              e instanceof Error ? e : new Error(e.statusText ?? 'error');
            logger.error(
              [CONTEXTS.ROUTER, CONTEXTS.PODCAST],
              errObj.message,
              {},
              errObj,
            );
          }
          return get(podcast, 'data', {});
        }),
    );
    const relatedPodcasts = relatedPodcastData.map(podcast => {
      // rename some keys because the API doesn't return the correct format
      const { imageUrl: imgUrl, id: seedId, follow: followed, ...p } = podcast;
      return {
        followed,
        imgUrl,
        seedId,
        stationType: STATION_TYPE.PODCAST,
        ...p,
      };
    });
    dispatch(receivedPodcasts(relatedPodcasts));
  };
}

export function requestFollowed(
  limit?: number | null,
  pageKey?: string | null,
): Thunk<Promise<void>> {
  return (dispatch, getState, { transport }) => {
    const state = getState();
    const { profileId, sessionId } = getCredentials(state);
    const ampUrl = getAmpUrl(state);
    const isAuthenticated = getIsAuthenticated(state);

    if ((getReceivedFollowed(state) || !isAuthenticated) && !pageKey)
      return Promise.resolve();

    return transport(
      getFollowed({
        ampUrl,
        limit: limit!,
        pageKey: pageKey!,
        profileId: profileId!,
        sessionId: sessionId!,
      }),
    ).then(({ data }) => {
      const nextPageKey = get(data, ['links', 'next'], undefined);
      dispatch(receivedFollowed({ nextPageKey, podcasts: data.data }));
      return data;
    });
  };
}

export function requestPodcast(id: number): Thunk<Promise<void>> {
  return async (dispatch, getState, { logger, transport }) => {
    const state = getState();
    const ampUrl = getAmpUrl(state);

    try {
      const { data } = await transport(getPodcast(id, ampUrl));
      dispatch(setPodcastProfile(data));
      return data;
    } catch (e: any) {
      const errObj = new Error(
        (e?.message || e?.statusText) ?? 'error getting podcast',
      );
      return logger.error(CONTEXTS.PODCAST, errObj.message, {}, errObj);
    }
  };
}

export function getPodcastEpisodeWithAuth(
  seedId: number,
): Thunk<Promise<void>> {
  return async (dispatch, getState, { transport }) => {
    const state = getState();
    const ampUrl = getAmpUrl(state);
    const { profileId, sessionId } = getCredentials(state);
    const { data } = await transport(
      getEpisode(seedId, ampUrl, profileId!, sessionId!),
    );

    dispatch(setPodcastEpisodes([data.episode]));
  };
}

export function getPodcastEpisodesWithAuth(
  seedId: number,
  limit: number,
  nextPageKey: string,
  sortBy: string,
  resetOrder: boolean,
): Thunk<Promise<any>> {
  return async (dispatch, getState, { logger, transport }) => {
    const state = getState();
    const ampUrl = getAmpUrl(state);
    const isAnonymous = getIsAnonymous(state);
    const { profileId, sessionId } = getCredentials(state);
    let data;
    try {
      ({ data } = await transport(
        getEpisodes({
          ampUrl,
          id: seedId,
          limit,
          pageKey: nextPageKey,
          profileId,
          sessionId,
          sortBy,
          isAnonymous,
        }),
      ));
    } catch (e: any) {
      const errObj =
        e instanceof Error ? e : new Error(e.statusText ?? 'error');
      logger.error(
        [CONTEXTS.REDUX, CONTEXTS.PODCAST],
        errObj.message,
        {},
        errObj,
      );
      throw errObj;
    }

    const setEpisodes =
      resetOrder ?
        reorderPodcastEpisodes({ episodes: data.data, seedId })
      : setPodcastEpisodes(data.data);
    dispatch(setEpisodes);
    return data;
  };
}

// includes seconds played and completed status
export function updatePodcastPlayProgress(
  position: number,
  podcastId: number | string,
  episodeId: number,
  completed?: boolean,
): Thunk<Promise<void>> {
  return async (dispatch, getState, { transport }) => {
    const state = getState();
    const ampUrl = getAmpUrl(state);
    const currentEpisodeDuration = getCurrentlyPlayingEpisodeDuration(state, {
      id: episodeId,
    });
    const { profileId, sessionId } = getCredentials(state);

    const completedState =
      typeof completed === 'boolean' ? completed : (
        currentEpisodeDuration - position <= state.config.markPlayedThreshold
      );
    dispatch(
      receivedPodcastPlayProgressData(position, episodeId, completedState),
    );
    await transport(
      setEpisodeProgress(
        podcastId,
        episodeId,
        ampUrl,
        profileId!,
        sessionId!,
        position,
        completedState,
      ),
    );
  };
}

export function getPodcasts(): Thunk<Promise<void>> {
  return async function thunk(dispatch, getState, { logger, transport }) {
    const state = getState();
    const translate = getTranslateFunction(state);
    const featuredTitle = translate('Featured');
    let response = {};
    try {
      response = await transport(
        getFeaturedCategory(
          getWebGraphQlUrl(state),
          getCountryCode(state),
          getLocale(state),
        ),
      );
    } catch (e: any) {
      const errObj =
        e instanceof Error ? e : new Error(e.statusText ?? 'error');
      logger.error(
        [CONTEXTS.REDUX, CONTEXTS.PODCAST],
        errObj.message,
        {},
        errObj,
      );
    }

    const {
      name,
      id,
      podcasts,
    }: {
      name: string;
      id: string | number;
      podcasts: Array<{
        description: string;
        id: string | number | undefined;
        slug: any;
        title: string;
      }>;
      title: string;
    } = {
      ...mapPodcastLeads(
        get(response, 'data.data.featured_podcasts'),
        featuredTitle,
        PODCAST_FEATURED_CATEGORY_ID,
      ),
      title: featuredTitle,
    };

    dispatch(receivedPodcastCategory(name, id, podcasts));
    dispatch(receivedPodcasts(podcasts));
  };
}

export function getPodcastCategory(categoryId: string): Thunk<Promise<void>> {
  return async function thunk(dispatch, getState, { transport }) {
    const state = getState();
    const { data } = await transport(getCategory(categoryId, getAmpUrl(state)));
    const { id, podcasts } = data;

    dispatch(receivedPodcastCategory('', id, podcasts));
    dispatch(receivedPodcasts(podcasts));
  };
}

export function getPodcastCategories(): Thunk<Promise<void>> {
  return async function thunk(dispatch, getState, { logger, transport }) {
    const state = getState();
    let response = {};
    try {
      response = await transport(
        getCategories(
          getWebGraphQlUrl(state),
          getCountryCode(state),
          getLocale(state),
        ),
      );
    } catch (e: any) {
      const errObj =
        e instanceof Error ? e : new Error(e.statusText ?? 'error');
      logger.error(
        [CONTEXTS.REDUX, CONTEXTS.PODCAST],
        errObj.message,
        {},
        errObj,
      );
    }

    const { categories } = mapCategoryLeads(get(response, 'data.data.topics'));

    dispatch(receivedPodcastCategories(categories as Array<Category>));
    dispatch(
      setPodcastCategoryIds(
        categories.map(category => category.id) as Array<number>,
      ),
    );
  };
}

export function getPodcastFeaturedCategories(): Thunk<Promise<void>> {
  return async function thunk(dispatch, getState, { logger, transport }) {
    const state = getState();
    const translate = getTranslateFunction(state);
    const featuredTitle = translate('Featured');
    let response = {};
    try {
      response = await transport(
        getFeaturedCategory(
          getWebGraphQlUrl(state),
          getCountryCode(state),
          getLocale(state),
        ),
      );
    } catch (e: any) {
      const errObj =
        e instanceof Error ? e : new Error(e.statusText ?? 'error');
      logger.error(
        [CONTEXTS.REDUX, CONTEXTS.PODCAST],
        errObj.message,
        {},
        errObj,
      );
    }

    const { name, id, podcasts } = {
      ...mapPodcastLeads(
        get(response, 'data.data.featured_podcasts'),
        featuredTitle,
        PODCAST_FEATURED_CATEGORY_ID,
      ),
    };

    dispatch(receivedPodcastCategory(name, id, podcasts));
    dispatch(receivedPodcasts(podcasts));
  };
}

export function getPodcastPopularCategories(): Thunk<Promise<void>> {
  return async function thunk(dispatch, getState, { logger, transport }) {
    const state = getState();
    const translate = getTranslateFunction(state);
    const popularTitle = translate('Popular');
    let response = {};
    try {
      response = await transport(
        getPopularCategory(
          getWebGraphQlUrl(state),
          getCountryCode(state),
          getLocale(state),
        ),
      );
    } catch (e: any) {
      const errObj =
        e instanceof Error ? e : new Error(e.statusText ?? 'error');
      logger.error(
        [CONTEXTS.ROUTER, CONTEXTS.PODCAST],
        errObj.message,
        {},
        errObj,
      );
    }
    const { id, name, podcasts } = mapPodcastLeads(
      get(response, 'data.data.popular_podcasts'),
      popularTitle,
      PODCAST_POPULAR_CATEGORY_ID,
    );

    dispatch(receivedPodcastCategory(name, id, podcasts));
    dispatch(receivedPodcasts(podcasts));
  };
}

export function getPodcastsByCategory(
  categoryId: string,
): Thunk<Promise<void>> {
  switch (categoryId) {
    case PODCAST_FEATURED_CATEGORY_ID:
      return getPodcastFeaturedCategories();
    case PODCAST_POPULAR_CATEGORY_ID:
      return getPodcastPopularCategories();
    default:
      return getPodcastCategory(categoryId);
  }
}

const receivedPodcastNetworks = (networks: Array<Network>) => ({
  payload: networks,
  type: RECEIVED_NETWORKS,
});

// We need to add error handling here,
// but we need to know what the visual
// state is for failure, so we are blocked by design for now.
// IHRWEB-14663 - adding limit causes wrong data order, awaiting RE fix
export function getPodcastNetworks(limit?: number): Thunk<Promise<void>> {
  return async function thunk(dispatch, getState, { logger, transport }) {
    const state = getState();
    try {
      const response = await transport(
        getNetworks(
          {
            baseUrl: getWebGraphQlUrl(state),
            countryCode: getCountryCode(state),
            locale: getLocale(state),
          },
          limit,
        ),
      );
      return dispatch(
        receivedPodcastNetworks(response.data.data.podcast_networks),
      );
    } catch (e: any) {
      const errObj =
        e instanceof Error ? e : new Error(e.statusText ?? 'error');
      logger.error(
        [CONTEXTS.REDUX, CONTEXTS.PODCAST],
        errObj.message,
        {},
        errObj,
      );
      return dispatch(receivedPodcastNetworks([]));
    }
  };
}

export function getPodcastNews(slugId: string): Thunk<Promise<void>> {
  return async function thunk(dispatch, getState, { logger, transport }) {
    const podcast = getState().podcast.shows[slugId];
    try {
      const editorialContentQuery = (
        podcast?.editorialContentQuery ?? []
      ).flat();
      // If there is no editorial content query, getContent will return an empty array. We do not need to make the request to webapi in that case.
      if (editorialContentQuery.length) {
        const graphQlUrl = getWebGraphQlUrl(getState());
        const gqlData: { data: PodcastArticleResponse } = await transport(
          getPodcastData({ baseUrl: graphQlUrl, tags: editorialContentQuery }),
        );
        const articles = gqlData.data.data.editorial.query;
        return dispatch(podcastArticlesLoaded(articles, slugId));
      } else {
        return dispatch(podcastArticlesLoaded([], slugId));
      }
    } catch (e: any) {
      const errObj =
        e instanceof Error ? e : new Error(e.statusText ?? 'error');
      return logger.error(
        [CONTEXTS.REDUX, CONTEXTS.PODCAST],
        errObj.message,
        {},
        errObj,
      );
    }
  };
}

export function getPodcastRecs(): Thunk<Promise<void>> {
  return async (dispatch, getState, { logger, transport }) => {
    const state = getState();
    const ampUrl = getAmpUrl(state);
    const { profileId, sessionId } = getCredentials(state);
    try {
      const { data }: { data: Array<Rec> & { tiles: Array<{ item: any }> } } =
        await transport(
          getPodcastRecsWithAuth({
            ampUrl,
            profileId: profileId!,
            sessionId: sessionId!,
          }),
        );
      dispatch(
        recsReceived({
          defaultRecs: false,
          id: PODCAST_RECS_CATEGORY_ID,
          recs: data,
          type: 'podcast',
        }),
      );

      const podcasts = data.tiles.map(podcast => podcast.item);
      dispatch(receivedPodcasts(podcasts));
    } catch (e: any) {
      const errObj =
        e instanceof Error ? e : new Error(e.statusText ?? 'error');
      logger.error(
        [CONTEXTS.REDUX, CONTEXTS.PODCAST],
        errObj.message,
        {},
        errObj,
      );
      throw errObj;
    }
  };
}
