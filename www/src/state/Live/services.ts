import composeRequest, {
  authHeaders,
  body,
  formBody,
  hostHeaders,
  method,
  query,
  urlTagged,
} from 'api/helpers';
import graphQL from 'api/graphql';
import { Filters, LiveReportingPayload } from './types';

// WEB-11542 - AV - 8/21/18
// to give the playback refactor some breathing room we moved the meta data handling here
// unfortunately typing the rest of the file was out of scope and will be handled in https://jira.ihrint.com/browse/WEB-12089
// just a note, flow doesn't have ignoring for blocks (https://github.com/facebook/flow/issues/740),
// so we have to fix every function definition (including anonymous if they're returned) to make this all work.

type QueryFilters = {
  countryCode: string;
  genreId?: number;
  limit: number;
  marketId?: number | string;
};

export function liveStations({
  ampUrl,
  filters,
}: {
  ampUrl: string;
  filters: QueryFilters;
}) {
  return composeRequest(
    method('get'),
    urlTagged`${{ ampUrl }}/api/v2/content/liveStations`,
    query(filters),
  )();
}

function formatQueryPayload(filters: Filters): QueryFilters {
  return {
    countryCode: filters?.country?.abbreviation.toUpperCase() ?? 'US',
    genreId: filters?.genre?.id,
    limit: 60,
    marketId: filters?.market?.marketId,
  };
}

export function stationQuery({
  ampUrl,
  filters,
}: {
  ampUrl: string;
  filters: Filters;
}) {
  return liveStations({ ampUrl, filters: formatQueryPayload(filters) });
}

export function getLiveStationById({
  id,
  ampUrl,
}: {
  id: string;
  ampUrl: string;
  countryCode?: string;
}) {
  const request = composeRequest(
    method('get'),
    urlTagged`${{ ampUrl }}/api/v2/content/liveStations/${{ stationId: id }}`,
  );

  return request();
}

export function getNowPlaying({
  seedId,
  ampUrl,
  limit = 3,
}: {
  seedId: number | string;
  ampUrl: string;
  limit?: number;
}) {
  const request = composeRequest(
    method('get'),
    urlTagged`${{ ampUrl }}/api/v3/live-meta/stream/${{
      stationId: seedId,
    }}/trackHistory`,
    query({ limit }),
  );

  return request();
}

export function getSimilarLiveStations({
  ampUrl,
  host,
  stationId,
}: {
  ampUrl: string;
  host: string;
  stationId: number;
}) {
  return composeRequest(
    urlTagged`${{ ampUrl }}/api/v1/recs/getLiveRadioStations`,
    method('get'),
    query({ liveRadioStationId: stationId }),
    hostHeaders(host),
  )();
}

export function profileGraphQl({
  locale,
  url: urlPath,
  slug,
}: {
  locale: string;
  url: string;
  slug: string;
}) {
  return graphQL(
    urlPath,
    { locale, slug, timeZone: 'UTC' },
    // The "timeline.type" field is renamed to "kind" because "type" is a Typescript keyword and we want to use this field in a discriminated union
    `
      query LiveProfile($slug: String!, $timeZone: String) {
        sites {
          find(type: SLUG, value: $slug) {
            onAirSchedule(timeZone: $timeZone) {
              current {
                ...scheduleFields
              }
              upcoming(take: 3) {
                ...scheduleFields
              }
            }
            config: configByLookup(lookup: "site-config-lookups/live") {
              podcasts: userConfig(glob: "general/default_podcasts")
              playlists: userConfig(glob: "general/default_playlists")
              social: configChunk(chunkId: "social")
              design: configChunk(chunkId: "design")
              contact: configChunk(chunkId: "contact")
              timeline: feed(params: { id: "USAGE:feed-usecases/Default Content" }) {
                results {
                  kind: type
                  data
                }
              }
              leads: feed(params: { id: "USAGE:feed-usecases/Default Promotions" }) {
                results {
                  data
                }
              }
            }
            canonicalHostname
            integration(type: "broadcast-facilities") {
              data
            }
            liveConfig {
              sections {
                ... on SitesTemplateInfernoSite {
                  navigation {
                    contest_nav_switch
                  }
                  contact {
                    eeo_report_asset {
                      asset {
                        href
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }

      fragment scheduleFields on SitesOnAirExtended {
        name
        coreShowId
        start: startTime12
        stop: stopTime12
        startMs
        stopMs
        destination {
          href
          thumbnail
        }
      }
    `,
  );
}

export function postLiveMetaData(
  metaData: LiveReportingPayload,
  params: { ampUrl: string; profileId: string; sessionId: string },
) {
  const { ampUrl, profileId, sessionId } = params;

  return composeRequest(
    method('post'),
    urlTagged`${{ ampUrl }}/api/v3/playback/liveStation/reporting`,
    body(metaData),
    authHeaders(profileId, sessionId),
  )();
}

export function reportStreamStarted({
  ampUrl,
  artistId,
  contentId,
  host,
  playedFrom,
  profileId,
  sessionId,
  stationId,
}: {
  ampUrl: string;
  artistId: number;
  contentId: number;
  host: string;
  playedFrom: number;
  profileId: number;
  sessionId: string;
  stationId: number;
}) {
  return composeRequest(
    urlTagged`${{ ampUrl }}/api/v1/liveRadio/reportStreamStarted`,
    method('post'),
    formBody({
      artistId,
      contentId,
      host,
      parentId: stationId,
      playedFrom: playedFrom || 300,
      profileId,
      sessionId,
    }),
  )();
}

export function registerListen({
  ampUrl,
  id,
  isSaved,
  profileId,
  sessionId,
}: {
  ampUrl: string;
  id: number;
  isSaved: boolean;
  profileId: number;
  sessionId: string;
}) {
  return composeRequest(
    urlTagged`${{ ampUrl }}/api/v1/liveRadio/${{
      profileId: String(profileId),
    }}/${{
      id: String(id),
    }}/registerListen`,
    method('post'),
    formBody({
      isSavedStation: !!isSaved,
      profileId,
      sessionId,
    }),
  )();
}
