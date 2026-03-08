import {
  Category,
  CustomLink,
  Episode,
  Host,
  Podcast,
  PodcastArticle,
  SocialMediaLink,
  State,
  Status,
} from './types';
import {
  createSelector,
  createStructuredSelector,
  OutputSelector,
} from 'reselect';
import { get } from 'lodash-es';
import {
  getCurrentEpisodeId,
  getResourceId,
  PlaylistInfo,
} from 'state/Routing/selectors';
import { joinPathComponents, slugify } from 'utils/canonicalHelpers';
import {
  PODCAST_FEATURED_CATEGORY_ID,
  PODCAST_POPULAR_CATEGORY_ID,
} from 'state/Podcast/constants';
import type { HighlightsMetadata } from 'api/highlights';
import type { State as PodcastState } from './types';
import type { State as RootState, Selector } from 'state/types';

export function getPodcastId(
  state: any,
  {
    podcastId,
  }: {
    podcastId: number | string;
  },
): number | string {
  return podcastId;
}

export const getPodcastRoot = createSelector<RootState, RootState, State>(
  state => state,
  (state: any): State => get(state, 'podcast', {}) as State,
);

export const getPodcasts = createSelector<
  RootState,
  State,
  Record<string, Podcast>
>(getPodcastRoot, root => get(root, 'shows', {}));

export const getPodcastEpisodes = createSelector<
  RootState,
  State,
  Record<string, Episode>
>(getPodcastRoot, root => get(root, 'episodes', {}) as Record<string, Episode>);

export const getPodcastHostMap: Selector<Record<string, Host>> = createSelector(
  getPodcastRoot,
  root => root.hosts,
);

export const getPodcastCategories: Selector<State['categories']> =
  createSelector(getPodcastRoot, root => get(root, 'categories', {}));

export const getPodcastNetworks: Selector<State['networks']> = createSelector(
  getPodcastRoot,
  root => root.networks,
);

export const getRequestStatus = createSelector<RootState, State, Status>(
  getPodcastRoot,
  root => get(root, 'status', {}) as Status,
);

export const getCategoryIds: Selector<State['categoryIds']> = createSelector(
  getPodcastRoot,
  root => get(root, 'categoryIds', []),
);

export const getHighlightsMetadata = createSelector<
  RootState,
  State,
  HighlightsMetadata | null
>(
  getPodcastRoot,
  root => get(root, 'highlightsMetadata', null) as HighlightsMetadata | null,
);

export const getCurrentPodcast = createSelector<
  RootState,
  Record<string, Podcast>,
  PlaylistInfo | string | null,
  Podcast
>(
  getPodcasts,
  getResourceId,
  (podcasts, id) => get(podcasts, String(id), {}) as Podcast,
);

export const getPodcastById = createSelector<
  RootState,
  { podcastId: string | number },
  Record<string, Podcast>,
  string | number,
  Podcast
>(
  getPodcasts,
  getPodcastId,
  (podcasts, id) => get(podcasts, String(id), {}) as Podcast,
);

export function makePodcastSelector<K extends keyof Podcast, F = Podcast[K]>(
  attr: K,
  fallback?: Podcast[K] | F,
) {
  return createSelector<RootState, Podcast, Podcast[K] | F>(
    getCurrentPodcast,
    podcast => get(podcast, attr, fallback) as Podcast[K] | F,
  );
}

export function makeStatusSelector<T extends keyof Status, F = Status[T]>(
  attr: T,
  fallback?: F,
) {
  return createSelector<RootState, Status, Status[T] | F>(
    getRequestStatus,
    status => get(status, attr, fallback) as Status[T] | F,
  );
}

export const getImgUrl = makePodcastSelector('imgUrl');

export const getEpisodes = makePodcastSelector(
  'episodes',
  [] as Array<Episode>,
);

export const getSeedId = makePodcastSelector('seedId');

export const getSeedType = makePodcastSelector('seedType');

export const getTitle = makePodcastSelector('title');

export const getPodcastAdTargeting = makePodcastSelector('adTargeting');

export const getHostIds = makePodcastSelector('hostIds', []);

export const getShowType = makePodcastSelector('showType');

export const getSlug = makePodcastSelector('slug');

export const getDescription = makePodcastSelector('description');

export const getIsFollowed = makePodcastSelector('followed');

export const getCurrentPodcastArticleSlugs = makePodcastSelector(
  'articles',
  [] as Array<string>,
) as OutputSelector<RootState, Array<string>, (res: Podcast) => Array<string>>;

export const getCustomLinks = makePodcastSelector(
  'customLinks',
  [] as Array<CustomLink>,
);

export const getSocialMediaLinks = makePodcastSelector(
  'socialMediaLinks',
  [] as Array<SocialMediaLink>,
);

export const getPodcastHosts: Selector<Array<Host>> = createSelector(
  getPodcastHostMap,
  getHostIds,
  (hostMap, hostIds) => {
    const podcastHosts: Array<Host> = [];
    hostIds.forEach(hostId => {
      const host = hostMap[hostId];
      /*
        The hostMap might not have been populated when we select the hosts, so this check exists to make sure
        we don't select an array of undefined
      */
      if (host) {
        podcastHosts.push({
          ...hostMap[hostId],
          hostId: hostMap[hostId].hostId ?? hostId,
        });
      }
    });
    return podcastHosts;
  },
);

export const getCurrentPodcastEpisode = createSelector(
  getPodcastEpisodes,
  getCurrentEpisodeId,
  (episodes, id) => get(episodes, String(id), null),
);

export function makePodcastEpisodeSelector<T>(
  attr: string,
  fallback?: T | null,
) {
  return createSelector<RootState, Episode | null, T>(
    getCurrentPodcastEpisode,
    episode => (episode ? get(episode, attr, fallback) : fallback) as T,
  );
}

export const getEpisodeTitle: Selector<string> =
  makePodcastEpisodeSelector('title');

export const getEpisodeDescription: Selector<string> =
  makePodcastEpisodeSelector('description');

export const getEpisodeId = makePodcastEpisodeSelector<number>('id');

export const getCurrentPodcastEpisodes = createSelector<
  RootState,
  Podcast,
  Record<string, Episode>,
  Array<Episode>
>(getCurrentPodcast, getPodcastEpisodes, (podcast, episodes) =>
  (get(podcast, 'episodeIds', []) as Array<number>).map(
    id => get(episodes, String(id), {}) as Episode,
  ),
);

function getCurrentlyPlayingEpisodeId(
  state: RootState,
  {
    id,
  }: {
    id: number | string;
  },
): number | string {
  return id;
}

export const getCurrentlyPlayingPodcastEpisode = createSelector(
  getPodcastEpisodes,
  getCurrentlyPlayingEpisodeId,
  (episodes, id) => get(episodes, String(id)),
);

export const getNextEpisode = createSelector(
  getCurrentPodcast,
  getCurrentlyPlayingEpisodeId,
  getPodcastEpisodes,
  (podcast, id, episodes) => {
    const episodeIds = get(podcast, 'episodeIds', [] as Array<number>)
      .concat(
        get(podcast, 'cachedEpisodeIds') as Array<number>,
        [] as Array<number>,
      )
      .filter(e => e);
    let currentIndex = episodeIds.indexOf(id as number) + 1;

    if (currentIndex <= 0) {
      return undefined;
    }

    // return undefined if all episodes are complete
    if (episodeIds.every(e => episodes[e].completed!)) {
      return undefined;
    }

    while (currentIndex < episodeIds.length) {
      const episodeId = episodeIds[currentIndex];
      const episode = episodes[episodeId];
      if (!episode) {
        return undefined;
      }
      if (!episode.completed) {
        return episodeId;
      }
      currentIndex += 1;
    }

    return undefined;
  },
);

export const getCurrentlyPlayingEpisodePosition = (
  state: RootState,
  { id }: { id: number },
) => state?.podcast?.episodes[id]?.secondsPlayed;

export const getCurrentlyPlayingEpisodeDuration = (
  state: RootState,
  { id }: { id: number },
) => state?.podcast?.episodes[id]?.duration;

export const getAllFollowed: Selector<Array<Podcast>> = createSelector(
  getPodcasts,
  podcasts =>
    Object.values(podcasts).filter(podcast => get(podcast, 'followed')) || [],
);

export const makePodcastCategorySelector = (categoryId: string) =>
  createSelector(
    getPodcastCategories,
    categories =>
      Object.values(categories).find(
        category => `${get(category, 'id')}` === categoryId,
      ) || ({} as Category),
  );

export const getFeaturedCategory = makePodcastCategorySelector(
  PODCAST_FEATURED_CATEGORY_ID,
);

export const getPopularCategory = makePodcastCategorySelector(
  PODCAST_POPULAR_CATEGORY_ID,
);

export const makeGetPodcastsByCategorySelector = (
  getCategorySelector: Selector<Category>,
): Selector<Array<Podcast>> =>
  createSelector(getPodcasts, getCategorySelector, (podcasts, category) => {
    if (!category) return [];
    return (get(category, 'podcasts', []) as Array<number>)
      .map(id => get(podcasts, `${id}`, {}))
      .filter(map => Object.keys(map).length) as Array<Podcast>;
  });

export const getFeaturedCategoryPodcasts: Selector<Array<Podcast>> =
  makeGetPodcastsByCategorySelector(getFeaturedCategory);

export const getPopularCategoryPodcasts: Selector<Array<Podcast>> =
  makeGetPodcastsByCategorySelector(getPopularCategory);

export const getCurrentPodcastCategory = createSelector(
  getPodcastCategories,
  getResourceId,
  (categories, id) => get(categories, String(id), {}),
);

export const getPodcastCategoryId: Selector<number | string> = createSelector(
  getCurrentPodcastCategory,
  category => get(category, 'id'),
);

export const getPodcastCategoryName: Selector<string> = createSelector(
  getCurrentPodcastCategory,
  category => get(category, 'name'),
);

export const getCategoryById = createSelector(
  getPodcastCategories,
  getResourceId,
  (categories, categoryId) => get(categories, String(categoryId), {}),
);

export const getCategoryPodcastIds = createSelector(
  getCategoryById,
  category => get(category, 'podcasts', []) as Array<number>,
);

export const getCategories = createSelector(
  getCategoryIds,
  getPodcastCategories,
  (ids, categories) => {
    if (!ids.length) return [];
    return ids.map(id => get(categories, String(id), {}));
  },
);

export function getSeedIdFromProps(
  state: any,
  {
    seedId,
    stationId,
  }: {
    seedId: number | string;
    stationId?: number | string;
  },
): number | string | undefined {
  return seedId || stationId;
}

export const getPodcastsByCategoryId = createSelector(
  getCategoryPodcastIds,
  getPodcasts,
  (podcastIds, podcasts) => podcastIds.map(id => get(podcasts, String(id), {})),
);

export const getFollowedBySeedId = createSelector(
  getPodcasts,
  getSeedIdFromProps,
  (podcasts, seedId) => get(podcasts, [String(seedId), 'followed']),
);

export const getTitleBySeedId = createSelector(
  getPodcasts,
  getSeedIdFromProps,
  (podcasts, seedId) => get(podcasts, [String(seedId), 'title']),
);

export const getReceivedFollowed: Selector<boolean> =
  makeStatusSelector('receivedFollowed');

export const getNextPageKey = makeStatusSelector('nextPageKey', undefined);

export type PodcastArticles = Array<PodcastArticle>;
export const getCurrentPodcastArticles = createSelector<
  RootState,
  Record<string, PodcastArticle>,
  Array<string>,
  PodcastArticles
>(
  state => state.podcast.articles,
  getCurrentPodcastArticleSlugs,
  (articles, podcastSlugs) =>
    podcastSlugs.map(slug => articles[slug]).filter(Boolean),
);

export function makePodcastDirectoryPath(
  categoryName: string,
  categoryId: string | number,
): string | null {
  return !categoryName || !categoryId ?
      null
    : joinPathComponents(
        '/podcast/category/',
        slugify(categoryName, categoryId),
      );
}
export function makePodcastPath(
  podcastSlug: string,
  podcastId: number,
): string | null {
  return !podcastSlug || !podcastId ?
      null
    : joinPathComponents('/podcast/', slugify(podcastSlug, podcastId));
}
export function makePodcastEpisodesDirectoryPath(
  podcastPath: string | null,
): string | null {
  return !podcastPath ? null : joinPathComponents(podcastPath, '/episodes/');
}
export function makePodcastEpisodePath(
  episodeTitle: string,
  episodeId: string | number,
  podcastPath: string | null,
): string | null {
  return !podcastPath || !episodeTitle || !episodeId ?
      null
    : joinPathComponents(
        podcastPath,
        '/episode/',
        slugify(episodeTitle, episodeId),
      );
}
export function makePodcastNewsPath(podcastPath: string | null): string {
  return !podcastPath ? '' : joinPathComponents(podcastPath, '/news/');
}

export const getPodcastDirectoryPath = createSelector(
  getPodcastCategoryName,
  getPodcastCategoryId,
  makePodcastDirectoryPath,
);
export const getPodcastPath = createSelector<
  RootState,
  string,
  number,
  string | null
>(getSlug, getSeedId, makePodcastPath);
export const getPodcastNewsPath = createSelector(
  getPodcastPath,
  makePodcastNewsPath,
);
export const getPodcastEpisodesDirectoryPath = createSelector(
  getPodcastPath,
  makePodcastEpisodesDirectoryPath,
);
export const getPodcastEpisodePath = createSelector<
  RootState,
  string,
  string | number,
  string | null,
  string | null
>(getEpisodeTitle, getEpisodeId, getPodcastPath, makePodcastEpisodePath);

export const structuredNetworksSelector = createStructuredSelector<
  RootState,
  { networks: PodcastState['networks'] }
>({
  networks: getPodcastNetworks,
});
