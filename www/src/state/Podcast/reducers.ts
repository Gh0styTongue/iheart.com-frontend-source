import { Article } from 'state/News/types';
import {
  Category,
  Episode,
  Host,
  Network,
  Podcast,
  PodcastArticle,
  State,
} from './types';
import {
  clone,
  concat,
  flow,
  get,
  merge,
  pick,
  reverse,
  setWith,
  uniq,
} from 'lodash-es';
import { extractPodcastId, receivePodcasts } from './helpers';
import { STATION_TYPE, StationTypeValue } from 'constants/stationTypes';
import type { HighlightsMetadata } from 'api/highlights';

export const initialState: State = {
  articles: {},
  categories: {},
  categoryIds: [],
  highlightsMetadata: null,
  episodes: {},
  hosts: {},
  networks: [],
  shows: {},
  status: {
    nextPageKey: undefined,
    receivedFollowed: false,
  },
};

export function setPodcastProfile(
  state: State = initialState,
  payload: Podcast,
) {
  const loadedPodcast = state.shows[payload.seedId] || {};

  return merge({}, state, {
    shows: receivePodcasts(state.shows, [{ ...loadedPodcast, ...payload }]),
  });
}

export function setHighlightsMetadata(
  state: State = initialState,
  payload: HighlightsMetadata | null,
) {
  return {
    ...state,
    highlightsMetadata: payload,
  };
}

export function receivedPodcast(
  state: State = initialState,
  {
    podcasts,
  }: {
    podcasts: Array<Podcast>;
  },
) {
  return merge({}, state, {
    shows: receivePodcasts(state.shows, podcasts),
  });
}

export function setIsFollowed(
  state: State = initialState,
  {
    podcastId,
    followed,
  }: {
    followed: boolean;
    podcastId: string;
  },
) {
  const showsState = { ...state.shows };
  showsState[podcastId] = { ...showsState[podcastId], followed };
  return merge({}, state, {
    shows: showsState,
  });
}

export function setPodcastEpisodes(
  state: State = initialState,
  payload: Array<Episode>,
) {
  return merge({}, state, {
    episodes: payload.reduce(
      (aggr, episode) => ({
        ...aggr,
        [episode.id]: merge(get(aggr, episode.id, {}), {
          ...episode,
          secondsPlayed: get(
            aggr,
            [String(episode.id), 'secondsPlayed'],
            episode.secondsPlayed,
          ),
        }),
      }),
      merge({}, state.episodes),
    ),
    shows: payload.reduce(
      (payloadState, episode) => {
        const podcastId = String(episode.podcastId);
        const episodeId = episode.id;
        const oldEpisodeIds = get(
          payloadState,
          [podcastId, 'episodeIds'],
          [] as Array<number>,
        );

        return oldEpisodeIds && oldEpisodeIds.includes(episodeId) ?
            payloadState
          : merge(
              payloadState,
              setWith(
                {},
                [podcastId, 'episodeIds'],
                oldEpisodeIds ? oldEpisodeIds.concat(episodeId) : [episodeId],
                Object,
              ),
            );
      },
      merge({}, state.shows),
    ),
  });
}

export function setPodcastHosts(
  state: State = initialState,
  payload: { [hostId: string]: Host },
) {
  return merge({}, state, { hosts: payload });
}

export function reorderPodcastEpisodes(
  state: State = initialState,
  payload: {
    episodes: Array<Episode>;
    seedId: number;
  },
): State {
  const { episodes, seedId } = payload;
  const stringifiedId = String(seedId);
  const show = get(state, ['shows', stringifiedId], {}) as Podcast;

  const episodeIds = flow(
    clone, // _.reverse mutates, clone first
    reverse,
    arr =>
      concat(
        arr,
        episodes.map(e => e.id),
      ),
    uniq,
  )((show as Podcast).cachedEpisodeIds || []);

  return {
    ...state,
    episodes: episodes.reduce(
      (aggr, episode) => ({
        ...aggr,
        [episode.id]: merge(get(aggr, episode.id, {}), {
          ...episode,
        }),
      }),
      merge({}, state.episodes),
    ),
    shows: {
      ...state.shows,
      [stringifiedId]: {
        ...show,
        //  we'll take the current episodes and preserve the order if a user flips the list
        // constantly. Is also used to preserve playist play order when the podcast is flipped
        cachedEpisodeIds: (show.episodeIds || []).slice().reverse(),
        episodeIds,
      },
    },
  };
}

export function receiveAllStationTypes(
  state: State = initialState,
  payload: Array<Podcast>,
) {
  return merge({}, state, {
    shows: receivePodcasts(
      state.shows,
      payload.filter(station =>
        ['TALKSHOW', 'PODCAST'].includes(station.stationType),
      ),
    ),
  });
}

export function receivedFollowed(
  state: State = initialState,
  {
    nextPageKey,
    podcasts,
  }: {
    nextPageKey: string | null | undefined;
    podcasts: Array<Podcast>;
  },
) {
  const merged = merge({}, state, {
    shows: receivePodcasts(state.shows, podcasts, true),
  });
  return Object.assign(merged, {
    status: { nextPageKey: nextPageKey || undefined, receivedFollowed: true },
  });
}

export function setLastPlayedDate(
  state: State = initialState,
  {
    seedType,
    seedId,
    timestamp,
  }: {
    seedId: number;
    seedType: string;
    timestamp: number;
  },
) {
  return merge({}, state, {
    shows:
      seedType === STATION_TYPE.PODCAST ?
        merge(
          {},
          state.shows,
          setWith({}, [String(seedId), 'lastPlayedDate'], timestamp, Object),
        )
      : state.shows,
  });
}

export function saveStation(
  state: State = initialState,
  { seedType, seedId, data: { lastPlayedDate } }: any,
) {
  return merge({}, state, {
    shows:
      seedType === STATION_TYPE.PODCAST ?
        merge(
          {},
          state.shows,
          setWith(
            {},
            [String(seedId), 'lastPlayedDate'],
            lastPlayedDate,
            Object,
          ),
        )
      : state.shows,
  });
}

export function articleLoaded(
  state: State = initialState,
  payload: {
    articles: Array<Article>;
    resource: { id: number | string; type: StationTypeValue | 'genre' };
  },
): State {
  if (get(payload, ['resource', 'type']) !== 'podcast') return state;

  return merge(
    {},
    state,
    setWith(
      {},
      ['shows', String(get(payload, ['resource', 'id'])), 'articles'],
      get(payload, 'articles').map(article => article.slug),
      Object,
    ),
  );
}

export function setPodcastEpisodePlayProgress(
  state: State = initialState,
  {
    completed,
    episodeId,
    position,
  }: {
    completed: boolean;
    episodeId: number;
    position: number;
  },
) {
  return {
    ...state,
    episodes: {
      ...state.episodes,
      [String(episodeId)]: {
        ...(state.episodes[String(episodeId)] || {}),
        completed,
        secondsPlayed: Math.floor(position),
      },
    },
  };
}

export function receivedPodcastCategory(
  state: State = initialState,
  {
    podcasts,
    id,
    name,
  }: {
    id: number;
    name: string;
    podcasts: Array<{
      description: string;
      id: string | number | undefined;
      slug: any;
      title: string;
    }>;
  },
) {
  const categoryKey = String(id);

  /* IHRWEB-13701: This check is only necessary because action `getPodcastCategory` uses AMP and
  returns an untranslated name. In that case, we don't want to overwrite the `name` we retrieved from WEBAPI.
  This check can be safely removed once all podcast data is retrieved from WEBAPI.
  */
  const categoryData =
    name ?
      {
        id: categoryKey,
        name,
        podcasts: podcasts.map(extractPodcastId),
      }
    : {
        id: categoryKey,
        podcasts: podcasts.map(extractPodcastId),
      };

  return merge(
    {},
    state,
    setWith({}, ['categories', categoryKey], categoryData, Object),
  );
}

export function receivedPodcastCategories(
  state: State = initialState,
  payload: {
    categories: Array<Category>;
  },
) {
  return merge({}, state, {
    categories: payload.categories
      .map(
        category =>
          pick(category, ['name', 'id', 'merge', 'image']) as Pick<
            Category,
            'name' | 'id' | 'image'
          >,
      )
      .reduce(
        (aggr, category) => ({
          ...aggr,
          [category.id]: merge(
            get(state.categories, category.id, {}),
            category,
          ),
        }),
        merge({}, state.categories),
      ),
  });
}

export function receivedPodcastNetworks(
  state: State = initialState,
  payload: Array<Network>,
): State {
  return {
    ...state,
    networks: payload,
  };
}

export function setPodcastCategoryIds(
  state: State = initialState,
  payload: Array<number>,
) {
  return merge({}, state, {
    categoryIds: uniq([...(state.categoryIds || []), ...payload]),
  });
}

export function removePodcastFromHistory(
  state: State,
  {
    seedId,
  }: {
    seedId: string;
  },
) {
  const podcast = get(state, ['shows', seedId]);
  if (podcast) {
    // we don't do a hard delete on podcasts because once we add playback for podcasts
    // if the deleted podcast is still playing then we need the data for the podcast until the song finishes
    return setWith(
      merge({}, state),
      ['shows', seedId, 'lastPlayedDate'],
      null,
      Object,
    );
  }
  return state;
}

export const podcastArticlesLoaded = (
  state: State,
  payload: { articles: Array<PodcastArticle>; podcastSlugId: string },
): State => ({
  ...state,
  articles: payload.articles.reduce(
    (memo, current) => ({ ...memo, [current.slug]: current }),
    state.articles,
  ),
  shows: {
    ...state.shows,
    [payload.podcastSlugId]: {
      ...state.shows[payload.podcastSlugId],
      articles: payload.articles.map(article => article.slug),
    },
  },
});
