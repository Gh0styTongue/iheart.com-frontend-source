/* eslint-disable camelcase */

import logger from 'modules/Logger';
import qs from 'qs';
import UrlParse from 'url-parse';
import {
  adswizzMeta,
  Country,
  Filters,
  Genre,
  LEADS,
  LiveMetaData,
  LiveMetaState,
  LiveProfileResponse,
  LiveReportingParams,
  LiveReportingPayload,
  LiveStation,
  PatternMatch,
  PUBLISHING,
  Show,
  State,
  TimelineArticle,
  TimelineItem,
  TimelineLead,
  TimelineResult,
  TimelineResultKind,
  UpdatedProfileResponse,
} from 'state/Live/types';
import { Card } from 'state/Hero/actions';
import { merge, pickBy } from 'lodash-es';
import { slugify } from 'utils/string';
import { WEB_HOSTS_SET } from 'constants/webHosts';
import type { Market } from 'state/Location/types';

export function buildFilterUrl(country: Country, market: Market, genre: Genre) {
  const countryComponent =
    country ? `/live/country/${country?.abbreviation}/` : '/live/';
  const marketComponent =
    market ?
      `city/${slugify(
        `${market?.city} ${market?.stateAbbreviation} ${market?.marketId}`,
      )}/`
    : '';
  const genreComponent =
    genre ? `?${qs.stringify({ genreId: genre?.id })}` : '';
  return `${countryComponent}${marketComponent}${genreComponent}`;
}

export function getMarketName(market?: Market | null, country?: Country) {
  const countryCode = country?.abbreviation;
  if (!market)
    return countryCode === 'US' ? `The ${country?.name}` : country?.name;
  return `${market?.city}, ${market?.stateAbbreviation}`;
}

type NameComparer = {
  name: string;
};

export function sortByName(thing1: NameComparer, thing2: NameComparer) {
  return thing1.name.localeCompare(thing2.name);
}

export const unwrapDJFields = (show: Show) => {
  const { destination, ...obj } = show;
  return {
    ...destination,
    ...obj,
  };
};

export function unwrapLeads(
  leads: Array<{ data: Card }> = [],
  stationSite?: string,
  siteUrl = 'https://www.iheart.com',
) {
  const parsedSiteUrl = UrlParse(siteUrl, {});

  // IHRWEB-15675: sometimes stationSite URL has the scheme, sometime it doesn't ... cleaning it out here
  // so that parsing below works correctly every time
  const cleanLocalUrl =
    (stationSite &&
      stationSite.replace('http://', '').replace('https://', '')) ||
    undefined;

  const parsedLocalUrl = UrlParse(
    cleanLocalUrl ? `https://${String(cleanLocalUrl)}` : siteUrl,
    {},
  );

  return leads.map(leadObj => {
    const lead = {
      ...leadObj.data,
      // note that we want these to open in a new tab so that they pick up all of our redirects/proxies
      // which are only on the server.
      target: '_blank',
    };
    const originalUrl = lead?.link?.urls?.web ?? '';
    const parsedUrl = UrlParse(originalUrl, {});

    // url-parse returns the hostname as localhost for relative urls.
    const isRelative = !parsedUrl.hostname;

    const leadUsesWWW = WEB_HOSTS_SET.has(parsedUrl.host);

    // all urls should be absolute.  If we have a stationSite
    // then we need them to be absolute since station sites will have routes that we don't.
    // If we don't have a stationSite then we need to resolve to www
    if (isRelative) {
      parsedUrl.set('hostname', parsedLocalUrl.hostname);
      parsedUrl.set('protocol', parsedLocalUrl.protocol);
      return {
        ...lead,
        url: parsedUrl.toString(),
      };
    }

    // also make sure that we're using the current env even if RE tells us to point at www.iheart.com
    if (!isRelative && leadUsesWWW) {
      parsedUrl.set('hostname', parsedSiteUrl.hostname);
      parsedUrl.set('protocol', parsedSiteUrl.protocol);
      return {
        ...lead,
        url: parsedUrl.toString(),
      };
    }

    return {
      ...lead,
      url: originalUrl,
    };
  });
}

export const graphqlDefaultData: UpdatedProfileResponse = {
  config: {
    podcasts: {
      general: {
        default_podcasts: [],
      },
    },
    playlists: {
      general: {
        default_playlists: [],
      },
    },
  },
  current: {
    coreShowId: 0,
    destination: {
      href: '',
      thumbnail: '',
    },
    name: '',
    start: '',
    stop: '',
  },
  hero: {
    background: '',
    image: '',
  },
  leads: [],
  social: {
    facebook_name: '',
    facebook_switch: false,
    instagram_name: '',
    instagram_switch: false,
    pinterest_name: '',
    pinterest_switch: false,
    request_phone_number: '',
    sms_number: '',
    snapchat_name: '',
    snapchat_switch: false,
    tiktok: '',
    tiktok_name: '',
    tiktok_switch: false,
    twitter_name: '',
    twitter_switch: false,
    youtube_name: '',
    youtube_switch: false,
  },
  timeline: [],
  upcoming: [],
  legalLinks: {
    facilities: null,
    assistance: null,
    contestRules: null,
    EEOPublicFile: null,
  },
};

function flattenTimeline(timelineResults: Array<TimelineResult> = []) {
  const timelineResultHandlers: PatternMatch<
    TimelineResult,
    TimelineResultKind,
    TimelineItem
  > = {
    [LEADS]: (result: TimelineLead) => {
      const { img_uri, title, link } = result.data;
      return {
        external_url: link.urls.web,
        img: img_uri,
        is_sponsored: false,
        title,
      };
    },
    [PUBLISHING]: (result: TimelineArticle) => {
      const { payload, slug, summary } = result.data;
      return {
        external_url: payload.external_url,
        feed_vendor: payload.feed_vendor,
        img: summary.image,
        is_sponsored: payload.is_sponsored,
        permalink: payload.permalink,
        slug,
        title: summary.title,
      };
    },
  };

  return timelineResults.reduce<Array<TimelineItem>>(
    (timelineItems, result) => {
      const handler = timelineResultHandlers[result.kind];
      if (handler) {
        try {
          return [...timelineItems, handler(result as any)];
        } catch (_e) {
          return timelineItems;
        }
      }

      const errObj = new Error(
        `${(result as TimelineResult).kind} is not a handled TimlineResultType`,
      );
      logger.error('flatTimeline', errObj.message, {}, errObj);
      return timelineItems;
    },
    [],
  );
}

export function parseProfileGraphQlData(
  graphqlData: LiveProfileResponse,
  { siteUrl, stationSite }: { siteUrl?: string; stationSite?: string } = {},
): UpdatedProfileResponse {
  const data = graphqlData?.data?.sites?.find ?? null;
  if (!data) return graphqlDefaultData;

  const { config, onAirSchedule, liveConfig, integration, canonicalHostname } =
    data;
  if (!config) return graphqlDefaultData;

  const { contact, design, leads, timeline, social } = config;
  const { upcoming = [], current } = onAirSchedule ?? {};
  const { hero_color, hero_image } = design;
  const { request_phone_number, sms_number } = contact;
  const stopMs = current?.stopMs;

  const {
    facebook_name,
    facebook_switch,
    instagram_name,
    instagram_switch,
    pinterest_name,
    pinterest_switch,
    snapchat_name,
    snapchat_switch,
    tiktok_name,
    tiktok_switch,
    twitter_name,
    twitter_switch,
    youtube_name,
    youtube_switch,
  } = social;

  // IHRWEB-14813
  // If tiktok_switch is true, shove 'tiktok_name' into 'tiktok' property, so that getSocial selector will select it
  const tiktok = tiktok_switch ? tiktok_name : undefined;

  // IHRWEB-14952
  // The default loading behavior for the Live On Air schedule wasn't updating on time, therefore resulting in an out of date "Current On Air Station"
  // timeUntilShiftChange is the number of seconds until the current live on air station ends, plus 30 seconds, to ensure headers are updated after the shift change
  // We use this value to set the "Cache-Control" headers, so Fastly knows how long to cache the current Live Station for
  const now = new Date();
  const timeUntilShiftChange =
    stopMs && Math.ceil((stopMs - now.getTime()) / 1000) + 30;

  return {
    config,
    current,
    hero: { background: hero_color, image: hero_image },
    leads: unwrapLeads(leads?.results, stationSite, siteUrl),
    social: {
      facebook_name,
      facebook_switch,
      instagram_name,
      instagram_switch,
      pinterest_name,
      pinterest_switch,
      request_phone_number,
      sms_number,
      snapchat_name,
      snapchat_switch,
      tiktok,
      tiktok_name,
      tiktok_switch,
      twitter_name,
      twitter_switch,
      youtube_name,
      youtube_switch,
    },
    timeline: flattenTimeline(timeline?.results),
    timeUntilShiftChange,
    upcoming: upcoming.filter(Boolean),
    legalLinks: {
      facilities:
        integration?.data?.broadcastFacilities?.reduce?.(
          (
            memo,
            { broadcastBand, broadcastCallLetters, politicalLinkOverride },
          ) => ({
            ...memo,
            [broadcastBand]: {
              public:
                broadcastBand ?
                  `https://publicfiles.fcc.gov/${broadcastBand.toLowerCase()}-profile/${broadcastCallLetters}`
                : '',
              political:
                politicalLinkOverride ||
                `https://politicalfiles.iheartmedia.com/files/location/${broadcastCallLetters}/`,
              callLetters: broadcastCallLetters,
            },
          }),
          {},
        ) ?? null,
      assistance:
        integration?.data?.broadcastFacilities?.length ?
          `https://${canonicalHostname}/content/public-file-assistance/`
        : null,
      contestRules:
        liveConfig?.sections?.navigation?.contest_nav_switch ?
          `https://${canonicalHostname}/rules`
        : null,
      EEOPublicFile:
        liveConfig?.sections?.contact?.eeo_report_asset?.asset?.href ?
          `${liveConfig?.sections?.contact?.eeo_report_asset?.asset?.href}?passthrough=1`
        : null,
    },
  };
}

export function getFilterKey(
  country: Country | null,
  market: Market | null,
  genre: Genre | null,
) {
  const countryId = country?.id ?? null;
  const marketId = market?.marketId ?? null;
  const genreId = genre?.id ?? null;
  return `country-${countryId}-market-${marketId}-genre-${genreId}`;
}

export function receiveStations(
  state: State,
  stations: Array<LiveStation>,
  { country, market, genre }: Partial<Filters> = {},
) {
  return merge({}, state, {
    stationLists:
      country || market || genre ?
        merge({}, state.stationLists, {
          [getFilterKey(country!, market!, genre!)]: stations.map(({ id }) =>
            String(id),
          ),
        })
      : state.stationLists,
    stations: merge(
      {},
      state.stations,
      stations.reduce(
        (aggr, station) => ({
          ...aggr,
          [station.id]: {
            ...station,
            thumbs: Object.assign(
              station.thumbsDown ?
                station.thumbsDown.reduce(
                  (aggregate, id) => ({ ...aggregate, [id]: -1 }),
                  {},
                )
              : {},
              station.thumbsUp ?
                station.thumbsUp.reduce(
                  (aggregate, id) => ({ ...aggregate, [id]: 1 }),
                  {},
                )
              : {},
            ),
          },
        }),
        {},
      ),
    ),
  });
}

export function parseMetaDataString(metaDataString = ''): {
  [a: string]: string;
} {
  return metaDataString.split(' ').reduce((asObject, keyValueString) => {
    const [key, value] = keyValueString.split('=');
    if (!value) return asObject;
    const withoutEscapes = value
      .replace('\\', '')
      .replace(/^"/, '')
      .replace(/"$/, '');
    return {
      ...asObject,
      [key]: withoutEscapes,
    };
  }, {});
}

export function shouldPostMetaData(
  prevMetaData: LiveMetaState = { type: 'unhandledCase' },
  { songSpot, spotInstanceId, stationId, type }: LiveMetaState,
) {
  return !!(
    type !== 'adswizz' &&
    songSpot === 'T' &&
    spotInstanceId &&
    spotInstanceId !== '-1' &&
    (spotInstanceId !== prevMetaData.spotInstanceId ||
      (prevMetaData.stationId && stationId !== prevMetaData.stationId))
  );
}

export function getLiveMarketUrl(
  market: Market,
  currentCountry: Country | null,
  genreId?: number,
) {
  const genreParam = genreId ? `?genreId=${genreId}` : '';
  const countryAbbreviation = currentCountry?.abbreviation ?? 'US';
  const pathname =
    market ?
      `/live/country/${market.countryAbbreviation}/city/${slugify(
        market.name,
      )}-${market.marketId}/${genreParam}`
    : `/live/country/${countryAbbreviation}/${genreParam}`;
  return pathname;
}

const isAdswizzMeta = (data: LiveMetaData): data is adswizzMeta =>
  !!(data as adswizzMeta).COMM;

export function processMetaData(
  data: LiveMetaData,
  stationId: number,
  listenerId: string,
): [LiveMetaState, LiveReportingParams] {
  let metaData;
  let liveReportingParams = {};
  if (isAdswizzMeta(data)) {
    // this is an adswizz ad
    metaData = {
      adswizzId: parseMetaDataString(data?.COMM?.ENG).adswizzContext,
      listenerId,
      stationId,
      type: 'adswizz',
    };
  } else {
    const {
      customData,
      artist: description,
      TPE1: descriptionFallback,
      title,
      TIT2: titleFallback,
    } = data;

    const {
      amgArtistId,
      amgTrackId,
      TAID: artistId,
      cartcutId,
      amgArtworkUrl: imageUrl,
      itunesTrackId,
      length,
      MediaBaseId,
      song_spot: songSpot,
      spotInstanceId,
      TPID: trackId,
      unsID,
    } = customData ?? (parseMetaDataString(data.url) as any);

    const sharedPayload = {
      artistId,
      description: description || descriptionFallback,
      imageUrl,
      listenerId,
      songSpot,
      spotInstanceId,
      stationId,
      title: title || titleFallback,
      trackId,
    };
    liveReportingParams = {
      amgArtistId,
      amgTrackId,
      itunesTrackId,
      length,
      MediaBaseId,
      unsID,
    };
    if (customData && Object.keys(customData).length <= 2) {
      // this is a spot block placeholder
      metaData = {
        isSpotEnd: parseMetaDataString(title).text === '"Spot Block End"',
        type: 'spotBlock',
        ...sharedPayload,
      };
    } else if (
      songSpot === 'T' &&
      ((cartcutId && cartcutId !== '0') ||
        (spotInstanceId && spotInstanceId !== '-1'))
    ) {
      // this is a viero ad, legacy ads code seems to explicitly indicate that
      metaData = {
        cartcutId,
        type: 'viero',
        ...sharedPayload,
      };
    } else if (['M', 'F'].includes(songSpot ?? '') && trackId) {
      // we have a track and metadata for that track
      metaData = {
        type: 'music',
        ...sharedPayload,
      };
    } else if (['M', 'F', 'T'].includes(songSpot ?? '')) {
      // this may be music that we don't have an id for or a dj or iheart advertising for itself (the 'T' song spot value).
      metaData = {
        type: 'djSpot',
        ...sharedPayload,
      };
    } else {
      // we hopefully won't get here
      // there is an "O" songSpot value that isn't handled
      metaData = {
        type: 'unhandledCase',
        ...sharedPayload,
      };
    }
  }
  return [
    metaData as LiveMetaState,
    liveReportingParams as LiveReportingParams,
  ];
}

export function getLiveReportingPayload(
  metaData: LiveMetaState,
  liveReportingParams: LiveReportingParams,
  additionalParams: {
    hostName: string;
    playedFrom: number;
    profileId?: string;
  },
): LiveReportingPayload {
  const {
    artistId,
    cartcutId,
    imageUrl,
    listenerId,
    songSpot,
    spotInstanceId,
    stationId,
    trackId,
  } = metaData;

  const { amgArtistId, amgTrackId, itunesTrackId, length, MediaBaseId, unsID } =
    liveReportingParams;

  const { hostName, playedFrom, profileId } = additionalParams;

  const payload: Partial<LiveReportingPayload> = {
    adID: listenerId,
    amgArtistId,
    amgArtworkURL: imageUrl,
    amgTrackId,
    cartcutId,
    hostName,
    itunesTrackId,
    length,
    MediaBaseId,
    playedFrom,
    profileId,
    songSpot,
    spotInstanceId,
    stationId,
    stationType: 'LIVE',
    TAID: artistId,
    TPID: trackId,
    unsID,
  };

  return pickBy(payload, value => value !== undefined) as LiveReportingPayload;
}
