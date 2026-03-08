/* eslint-disable camelcase */

import nodeUrl from 'url';
import { get, merge } from 'lodash-es';
import { matchPath } from 'react-router';
import { parseId, parseSlugFromUrl } from './shims';
import { Podcast, Rec, RecommendPodcast } from 'state/Podcast/types';
import { slugify } from 'utils/string';
import { STATION_TYPE } from 'constants/stationTypes';

export function getPodcastUrl(
  podcastId?: string | number,
  podcastSlug?: string,
) {
  if (!podcastId || !podcastSlug) {
    return '';
  }

  // lowercase to prevent unneeded redirects
  return `/podcast/${podcastSlug.toLowerCase()}-${podcastId}/`;
}

export function getEpisodeUrl(episodeId: number, title: string) {
  if (!episodeId || !title) {
    return '';
  }
  return `episode/${slugify(title)}-${episodeId}/`;
}

export function getPodcastEpisodeUrl(
  podcastId: string | number,
  podcastSlug: string,
  episodeId: number,
  title: string,
  position?: number,
) {
  if (!podcastId || !podcastSlug || !episodeId || !title) {
    return '';
  }
  const positionQs = position ? `?position=${position}` : '';
  return (
    getPodcastUrl(podcastId, podcastSlug) +
    getEpisodeUrl(episodeId, title) +
    positionQs
  );
}

export function getPodcastCategoryUrl(
  categoryName: string,
  categoryId: number,
) {
  if (!categoryName || !categoryId) return null;
  return `/podcast/category/${slugify(categoryName)}-${categoryId}/`;
}

export function episodeProgress(
  secondsPlayed: number | null | undefined,
  duration: number,
) {
  if (secondsPlayed === null || secondsPlayed === undefined) return 0;
  return Math.ceil((secondsPlayed / duration) * 100) / 100;
}

export function extractPodcastId({
  seedShowId,
  seedId,
  id,
}: {
  id?: string | number;
  seedId?: number;
  seedShowId?: number;
}) {
  return seedShowId || seedId || id;
}

export function mapPodcastData(podcast: Podcast): Podcast {
  const podcastId = extractPodcastId(podcast);
  return {
    customLinks: podcast.customLinks,
    description: podcast.description,
    editorialContentQuery: podcast.editorialContentQuery,
    followed: podcast.followed,
    hostIds: podcast.hostIds,
    id: podcastId as number,
    imgUrl: podcast.imagePath || podcast.imageUrl || podcast.imgUrl,
    isExternal: podcast.isExternal,
    lastPlayedDate: podcast.lastPlayedDate,
    lastUpdated: podcast.lastUpdated,
    name: podcast.name,
    newEpisodeCount: podcast.newEpisodeCount,
    seedId: podcastId as number,
    seedShowId: podcastId as number,
    seedType: STATION_TYPE.PODCAST,
    showType: podcast.showType,
    slug: podcast.slug,
    socialMediaLinks: (
      get(podcast, 'socialMediaLinks', []) as Array<{
        link: string;
        name: string;
      }>
    ).map(({ link, name }) => {
      // TODO: Figure out how to mitigate this bad pattern and fix it [DEM 07142020]

      // This is bad and needs to be refactored, but for now, this will do.
      // There is a side effect of this helper - the 'links' are stored in AMP as just usernames
      // and then are transformed here. In place. Subsequent browses to the same podcast
      // cause the transform to take place again, and again, and again...
      // So the UI ends up with links like https://www.x.com/https://www.x.com/https://www.x.com/https://www.x.com/ElvisDuranShow////

      let transformed;

      switch (name) {
        case 'twitter_username':
          transformed =
            link.includes('twitter.com') || link.includes('x.com') ?
              link
            : `https://www.x.com/${link}/`;
          break;
        case 'instagram_username':
          transformed =
            link.includes('instagram.com') ? link : (
              `https://www.instagram.com/${link}/`
            );
          break;
        case 'pintrest_username':
          transformed =
            link.includes('pinterest.com') ? link : (
              `https://www.pinterest.com/${link}/`
            );
          break;
        case 'tiktok_username':
          transformed =
            link.includes('tiktok.com') ? link : (
              `https://www.tiktok.com/@${link}`
            );
          break;
        default:
          transformed = link;
          break;
      }
      return { link: transformed, name };
    }),
    stationType: 'podcast',
    title: podcast.title || podcast.name || '',
    adTargeting: podcast?.adTargeting ?? undefined,
    url: getPodcastUrl(podcastId as number, podcast.slug),
  };
}

export function receivePodcasts(
  state: {
    [a: string]: Podcast;
  },
  podcasts: Array<Podcast>,
  followed = false,
) {
  return podcasts.map(mapPodcastData).reduce(
    (aggr, podcast) => ({
      ...aggr,
      [podcast.id]: {
        ...podcast,
        episodeIds: get(state, [podcast.id, 'episodeIds'], []),
        followed:
          followed || podcast.followed || get(state, [podcast.id, 'followed']),
      },
    }),
    merge({}, state),
  );
}

export function mapCategoryLeads(
  leadsApiResponse?: Array<{
    img_uri: string;
    link: { urls: { web: string; device: string } };
    title: string;
  }>,
) {
  if (!leadsApiResponse) return { categories: [] };
  return {
    categories: leadsApiResponse
      .map(
        ({
          img_uri,
          link: {
            urls: { web, device },
          },
          title,
        }) => ({
          id: parseId(web, device),
          image: img_uri,
          name: title,
        }),
      )
      .filter(({ id }) => id !== undefined),
  };
}

const parseIdFromWebUrl = (webUrl: string) => {
  const { pathname } = nodeUrl.parse(webUrl);

  if (!pathname) return undefined;

  const match = matchPath<{ slug: string }>(pathname, {
    exact: true,
    path: '/podcast/:slug',
  });
  if (match && match.params && match.params.slug) {
    return parseInt(match.params.slug.split('-').pop()!, 10);
  }

  return undefined;
};

export function mapPodcastLeads(
  response: Array<{
    catalog: {
      id: string;
    };
    img_uri?: string;
    link: {
      urls: {
        web: string;
      };
    };
    subtitle: string;
    title: string;
  }>,
  name: string,
  categoryId: number | string,
) {
  if (!response) return { id: 0, name: '', podcasts: [] };
  return {
    id: categoryId,
    name,
    podcasts: response
      .map(
        ({
          subtitle,
          title,
          link: {
            urls: { web },
          },
          img_uri,
          catalog,
        }) => ({
          description: subtitle,
          id: catalog ? catalog.id : parseIdFromWebUrl(web),
          imgUrl: img_uri,
          slug: parseSlugFromUrl(web),
          title,
        }),
      )
      .filter(({ id: cardId }) => cardId !== undefined),
  };
}

export function formatPodcastRecs(recs: Array<Rec>, followed: Array<Podcast>) {
  return recs.reduce((result: Array<RecommendPodcast>, rec: Rec) => {
    const { meta, item } = rec;
    const {
      editorialContentQuery,
      title,
      description,
      id: seedId,
      imageUrl,
      slug,
    } = item;
    const { contentType: seedType } = meta;
    const isFollowed = followed.map(f => f.id).includes(seedId);
    const url = slug.includes(String(seedId)) ? slug : `${slug}-${seedId}`;
    const formatedData = [
      ...result,
      {
        description,
        editorialContentQuery: [editorialContentQuery],
        followed: isFollowed,
        id: seedId,
        imgUrl: imageUrl,
        seedId,
        seedShowId: seedId,
        seedType,
        slug,
        stationType: STATION_TYPE.PODCAST,
        title,
        url,
      },
    ];
    return formatedData;
  }, []);
}
