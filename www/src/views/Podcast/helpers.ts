import Logger, { CONTEXTS } from 'modules/Logger';
import { AxiosInstance } from 'axios';
import {
  getEpisode,
  getPodcast,
  getPodcastBySlug,
} from 'state/Podcast/services';
import { getEpisodeUrl, getPodcastUrl } from 'state/Podcast/helpers';
import type { Force404Data } from 'state/Routing/types';

type ReorderPodcastEpisodesReturn = {
  newEpisodeOrder: number;
  next: any;
};

export async function reorderPodcastEpisodes(
  getPodcastEpisodesWithAuth: (
    seedId: string,
    pageEpisodeLimit: number,
    nextPageKey: string | null | undefined,
    sort: string,
    resetOrder: boolean,
  ) => Promise<any>,
  seedId: string,
  episodeOrder: 0 | 1,
): Promise<ReorderPodcastEpisodesReturn> {
  const newEpisodeOrder = episodeOrder > 0 ? 0 : 1;
  const episodeOrderMap = ['startDate-desc', 'startDate-asc'];
  const pageEpisodeLimit = 40;
  const {
    links: { next },
  } = await getPodcastEpisodesWithAuth(
    seedId,
    pageEpisodeLimit,
    undefined,
    episodeOrderMap[newEpisodeOrder],
    true,
  );
  return { newEpisodeOrder, next };
}

type Opts = {
  ampUrl: string;
  transport: AxiosInstance;
  logger: typeof Logger;
  profileId?: number | null;
  sessionId?: string | null;
};

/*
 * Make calls for when PODCAST slug is incorrect
 */
export async function handlePodcastPathIncorrect(
  slugOrId: string | number,
  opts: Opts,
): Promise<Force404Data> {
  const { ampUrl, transport, logger } = opts;
  let suggestedTitle = null;
  let suggestedUrl = null;

  if (slugOrId) {
    const isSlugNumeric = /^\d+$/.test(String(slugOrId));

    const getPodcastData =
      isSlugNumeric ?
        getPodcast(slugOrId, ampUrl)
      : getPodcastBySlug(String(slugOrId), ampUrl);

    let podcastData;
    try {
      podcastData = await transport(getPodcastData);
    } catch (e: any) {
      const errObj = e instanceof Error ? e : new Error(e);
      logger.error(
        [CONTEXTS.ROUTER, CONTEXTS.PODCAST],
        errObj.message,
        {},
        errObj,
      );
    }

    const { id, slug, title } = podcastData?.data ?? {};

    if (id && slug && title) {
      suggestedTitle = title;
      suggestedUrl = getPodcastUrl(id, slug);
    }
  }

  return { suggestedTitle, suggestedUrl };
}

export function buildEpisodeSuggestedDest(
  suggestedTitle: string | null = null,
  suggestedUrl: string | null = null,
  id?: number,
  title?: string,
): Force404Data {
  if (suggestedTitle && suggestedUrl && id && title) {
    return {
      suggestedTitle: `${title} - ${suggestedTitle}`,
      suggestedUrl: `${suggestedUrl}${getEpisodeUrl(id, title)}`,
    };
  }
  return { suggestedTitle, suggestedUrl };
}
/*
 * Make calls for when PODCAST EPISODE slug is incorrect
 */
export async function handlePodcastEpisodePathIncorrect(
  episodeSlugAsNumber: number | string | null | undefined,
  podcastIdFromState: number | string | null | undefined,
  opts: Opts & { profileId: number | null; sessionId: string | null },
): Promise<Force404Data> {
  const { ampUrl, logger, profileId, sessionId, transport } = opts;

  let episodeData;

  if (episodeSlugAsNumber) {
    try {
      episodeData = await transport(
        getEpisode(episodeSlugAsNumber as number, ampUrl, profileId, sessionId),
      );
    } catch (e: any) {
      const errObj = e instanceof Error ? e : new Error(e);
      logger.error(
        [CONTEXTS.ROUTER, CONTEXTS.PODCAST],
        errObj.message,
        {},
        errObj,
      );
    }
  }

  const { id, podcastId, title } = episodeData?.data?.episode ?? {};

  /*
    grab podcast title (not available in episode data)
    also grab podcast slug: sometimes our data-authoring can be bad and we'll not have a `podcastSlug` available to us,
    we'll grab the podcast's data here
  */

  let suggestedTitle = null;
  let suggestedUrl = null;

  try {
    ({ suggestedTitle, suggestedUrl } = (await handlePodcastPathIncorrect(
      podcastId || podcastIdFromState,
      opts,
    )) ?? { suggestedTitle, suggestedUrl });
  } catch (e: any) {
    const errObj = e instanceof Error ? e : new Error(e);
    logger.error(
      [CONTEXTS.ROUTER, CONTEXTS.PODCAST],
      errObj.message,
      {},
      errObj,
    );
  }

  return buildEpisodeSuggestedDest(suggestedTitle, suggestedUrl, id, title);
}
