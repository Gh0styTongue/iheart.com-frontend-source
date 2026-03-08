import composeRequest, {
  authHeaders,
  body,
  method,
  query,
  urlTagged,
} from 'api/helpers';
import graphQL from 'api/graphql';
import { identity } from 'lodash-es';
import {
  PODCAST_DIRECTORY_COLLECTION,
  PODCAST_FEATURED_COLLECTION,
  PODCAST_POPULAR_COLLECTION,
} from './constants';

export function getEpisode(
  id: number,
  ampUrl: string,
  profileId: number | null,
  sessionId: string | null,
) {
  return composeRequest(
    method('get'),
    urlTagged`${{ ampUrl }}/api/v3/podcast/episodes/${{ episodeId: id }}`,
    profileId && sessionId ? authHeaders(profileId, sessionId) : identity,
  )();
}

export function getPodcast(id: string | number | null, ampUrl: string) {
  return composeRequest(
    method('get'),
    urlTagged`${{ ampUrl }}/api/v3/podcast/podcasts/${{ podcastId: id || '' }}`,
  )();
}

export function getPodcastHosts(leadsUrl: string, hostIds: Array<string>) {
  const hostsQuery = hostIds
    .map(
      (hostId, index) => `
      host${index}: get (
        type: "content:author"
        select: { id: "${hostId}" }
      ) {
        summary {
          title
          image
          description
        }
        payload
      }`,
    )
    .join('');

  return graphQL(
    leadsUrl,
    {},
    `
    query content {
      hosts: pubsub {${hostsQuery}
      }
    }
    `,
  );
}

export function getPodcastBySlug(slug: string, ampUrl: string) {
  return composeRequest(
    method('get'),
    urlTagged`${{ ampUrl }}/api/v3/podcast/podcasts/slug/${{
      podcastSlug: slug,
    }}`,
  )();
}

export function getFollowed({
  limit,
  pageKey,
  profileId,
  sessionId,
  ampUrl,
}: {
  limit: number;
  pageKey: string;
  profileId: number;
  sessionId: string;
  ampUrl: string;
}) {
  return composeRequest(
    method('get'),
    urlTagged`${{ ampUrl }}/api/v3/podcast/follows`,
    authHeaders(profileId, sessionId),
    query({ withNewEpisodeCounts: true, limit, pageKey, sortBy: 'TITLE' }),
  )();
}

export function setFollowed({
  profileId,
  sessionId,
  ampUrl,
  seedId,
  followed,
}: {
  profileId: number;
  sessionId: string;
  ampUrl: string;
  seedId: number | string;
  followed: boolean;
}) {
  return composeRequest(
    method(followed ? 'put' : 'delete'),
    urlTagged`${{ ampUrl }}/api/v3/podcast/follows/${{ podcastId: seedId }}`,
    authHeaders(profileId, sessionId),
  )();
}

export function getEpisodes({
  id,
  ampUrl,
  pageKey,
  limit = 10,
  profileId,
  sessionId,
  sortBy,
  isAnonymous = false,
}: {
  id: number | null;
  ampUrl: string;
  pageKey?: string;
  limit?: number;
  profileId: number | null;
  sessionId: string | null;
  sortBy?: string;
  isAnonymous: boolean;
}) {
  return composeRequest(
    method('get'),
    urlTagged`${{ ampUrl }}/api/v3/podcast/podcasts/${{
      podcastId: id || '',
    }}/episodes`,
    profileId && sessionId ? authHeaders(profileId, sessionId) : identity,
    query({ newEnabled: !isAnonymous, limit, pageKey, sortBy }),
  )();
}

export function getCategories(
  leadsUrl: string,
  countryCode: string,
  locale: string,
) {
  return graphQL(
    leadsUrl,
    {
      locale,
      query: {
        subscription: {
          tags: [PODCAST_DIRECTORY_COLLECTION, `countries/${countryCode}`],
        },
      },
    },
    `
      query Topics($query: QueryInput!, $locale: String) {
        topics: leads(query: $query, locale: $locale) {
          img_uri,
          title,
          link {
            urls {
              web,
              device
            }
          }
        }
      }
    `,
  );
}

export function getFeaturedCategory(
  leadsUrl: string,
  countryCode: string,
  locale: string,
  limit?: number,
) {
  return graphQL(
    leadsUrl,
    {
      locale,
      query: {
        limit,
        subscription: {
          tags: [PODCAST_FEATURED_COLLECTION, `countries/${countryCode}`],
        },
      },
    },
    `
      query FeaturedPodcasts($query: QueryInput!, $locale: String) {
        featured_podcasts: leads(query: $query, locale: $locale) {
          subtitle,
          title,
          img_uri,
          link {
            urls {
              web
            }
          },
          catalog {
            id
          }
        }
      }
    `,
  );
}

export function getPopularCategory(
  leadsUrl: string,
  countryCode: string,
  locale: string,
  limit?: number,
) {
  return graphQL(
    leadsUrl,
    {
      locale,
      query: {
        limit,
        subscription: {
          tags: [PODCAST_POPULAR_COLLECTION, `countries/${countryCode}`],
        },
      },
    },
    `
      query PopularPodcasts($query: QueryInput!, $locale: String) {
        popular_podcasts: leads(query: $query, locale: $locale) {
          subtitle,
          title,
          img_uri,
          link {
            urls {
              web
            }
          },
          catalog {
            id
          }
        }
      }
    `,
  );
}

export function getCategory(id: string, ampUrl: string) {
  return composeRequest(
    method('get'),
    urlTagged`${{ ampUrl }}/api/v3/podcast/categories/${{ categoryId: id }}`,
  )();
}

export function getNetworks(
  {
    baseUrl,
    countryCode = 'US',
    locale = 'en-US',
  }: { baseUrl: string; countryCode?: string; locale?: string },
  limit?: number,
) {
  return graphQL(
    baseUrl,
    {
      locale,
      query: {
        limit,
        subscription: {
          tags: [
            'collections/podcast-networks',
            `countries/${countryCode.toUpperCase()}`,
          ],
        },
      },
    },
    `
      query Networks($query: QueryInput!, $locale: String) {
        podcast_networks: leads(query: $query, locale: $locale) {
          title
          img_uri
          link {
            urls {
              web
              device
            }
          }
        }
      }
    `,
  );
}

export function setEpisodeProgress(
  podcastId: number | string,
  episodeId: number,
  ampUrl: string,
  profileId: number,
  sessionId: string,
  secondsPlayed: number,
  completed: boolean,
) {
  return composeRequest(
    method('put'),
    urlTagged`${{ ampUrl }}/api/v3/podcast/podcasts/${{
      podcastId,
    }}/progress/${{ episodeId }}`,
    body({ completed, secondsPlayed: Math.floor(secondsPlayed) }),
    authHeaders(profileId, sessionId),
  )();
}

export function getPodcastData({
  baseUrl,
  tags,
}: {
  baseUrl: string;
  tags: Array<string>;
}) {
  return graphQL(
    baseUrl,
    { query: { limit: 30, subscription: { tags } } },
    `
    query getContent($query:QueryInput!) {
      editorial: content {
        query(query:$query) {
          ad_params {
            keywords
            topics
          }
          slug
          pub_start
          summary {
            image
            title
            description
          }
          payload {
            is_sponsored
          }
        }
      }
    }
    `,
  );
}

// amp support for this endpoint is gradually getting deprecated, prefer getEpisode.  Currently only used in the Media model and the video widget.
export function getEpisodeV1({
  episodeId,
  ampUrl,
}: {
  episodeId: number;
  ampUrl: string;
}) {
  return composeRequest(
    urlTagged`${{ ampUrl }}/api/v1/talk/getEpisode`,
    query({ episodeId }),
    method('get'),
  )();
}

export function getPodcastRecs({
  ampUrl,
  profileId,
  sessionId,
}: {
  ampUrl: string;
  profileId: number;
  sessionId: string;
}) {
  return composeRequest(
    method('get'),
    urlTagged`${{ ampUrl }}/api/v3/recs/podcastRecs`,
    authHeaders(profileId, sessionId),
  )();
}

export function setPodcastLastViewed({
  ampUrl,
  profileId,
  sessionId,
  podcastId,
}: {
  ampUrl: string;
  profileId: number;
  sessionId: string;
  podcastId: number;
}) {
  return composeRequest(
    method('PATCH'),
    urlTagged`${{ ampUrl }}/api/v3/podcast/podcasts/lastViewed`,
    body({ data: [{ id: Number(podcastId), lastViewed: Date.now() }] }),
    authHeaders(profileId, sessionId),
  )();
}

export function getPodcastTranscription({
  baseUrl,
  episodeId,
}: {
  baseUrl: string;
  episodeId: number;
}) {
  return graphQL(
    baseUrl,
    { episodeId },
    `
    query PodcastTranscription($episodeId: Int!) {
       podcastTranscriptionFormatter {
        format(
          episodeId: $episodeId,
          options: {
            outputFormat: HTML
            stripNewlines: true
            collapseSpeakers: true
            includeTimes: true
            collapseTimes: true
            timeCollapseThreshold: 20
          }
        )
      }
    }
    `,
  );
}
