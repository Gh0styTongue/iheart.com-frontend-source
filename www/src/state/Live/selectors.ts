/* eslint-disable camelcase */

import qs from 'qs';
import { createSelector } from 'reselect';
import { getCurrentGenreSparkStreamId } from 'state/Genres/selectors';
import { getFilterKey } from './helpers';
import { getPlaylists } from 'state/Playlist/selectors';
import { getPodcasts } from 'state/Podcast/selectors';
import { getResourceId } from 'state/Routing/selectors';
import { getTracks } from 'state/Tracks/selectors';
import { identity, uniq } from 'lodash-es';
import { joinPathComponents, slugify } from 'utils/canonicalHelpers';
import { Podcast } from 'state/Podcast/types';
import { State as RootState } from 'state/types';
import { Track } from 'state/Tracks/types';
import type { HighlightsMetadata } from 'api/highlights';
import type {
  LiveLegalLinks,
  LiveMetaState,
  LiveStation,
  Show,
  State,
} from './types';
import type { Market } from 'state/Location/types';
import type { Playlist } from 'state/Playlist/types';

export const getLiveRoot = createSelector<RootState, RootState, State>(
  state => state,
  (state: RootState): State => state?.live ?? ({} as State),
);

export const getHighlightsMetadata = createSelector<
  RootState,
  State,
  HighlightsMetadata | null
>(getLiveRoot, root => root?.highlightsMetadata ?? null);

export const getLiveStations = createSelector(
  getLiveRoot,
  root => root?.stations ?? {},
);

export const getVideoMapStatus = createSelector(
  [
    getLiveStations,
    (state: RootState, { stationId }: { stationId: number | string }) =>
      stationId,
  ],
  (stations, stationId) =>
    stations?.[String(stationId)]?.videoMapStatus ?? false,
);

export function getStationId(
  state: RootState,
  { stationId }: { stationId: number | string },
): number | string {
  return stationId;
}

export function getSeedIdFromProps(
  state: State,
  { seedId }: { seedId: number },
) {
  return seedId;
}

export const getFilters = createSelector(getLiveRoot, live => live?.filters);

export const getIsRequestingStations = createSelector(
  getLiveRoot,
  live => live?.isRequestingStations,
);

export const getStationLists = createSelector(
  getLiveRoot,
  live => live?.stationLists,
);

// stationLists is a map of Immutable filter maps to lists of station IDs
export const getStationIds = createSelector(
  [getFilters, getStationLists],
  (filters, stationLists) =>
    stationLists?.[
      getFilterKey(filters.country, filters.market, filters.genre)
    ],
);

export const shouldRequestStations = createSelector(
  [getStationIds, getIsRequestingStations],
  (stationIds, isRequestingStations) => !stationIds && !isRequestingStations,
);

export const hasSpecificStation = createSelector(
  [getStationId, getLiveStations],
  (id, live) => !!live?.[String(id)],
);

export const getStationsForCurrentFilters = createSelector(
  [getStationIds, getLiveStations],
  (stationIDs, live) => (stationIDs ? stationIDs.map(id => live?.[id]) : null),
);

export const getCountryOptions = createSelector(
  getLiveRoot,
  live => live?.countryOptions,
);

export const getCountryFilter = createSelector(
  getFilters,
  filters => filters?.country ?? null,
);

export const getCountryFilterName = createSelector(
  getCountryFilter,
  filters => filters?.abbreviation ?? null,
);

export const getMarketFilter = createSelector(
  getFilters,
  filters => filters?.market ?? null,
);

export const getMarketId = createSelector(
  getMarketFilter,
  filters => filters?.marketId ?? null,
);

export const getMarketFilterName = createSelector(
  getMarketFilter,
  filters => filters?.name ?? null,
);

export const getGenreFilter = createSelector(
  getFilters,
  filters => filters?.genre ?? null,
);

export const getGenreId = createSelector(
  getGenreFilter,
  filters => filters?.id ?? null,
);

/* Current Live Station selectors */
export const getCurrentStation = createSelector(
  getLiveStations,
  getResourceId,
  (stations, id) => stations?.[String(id)] ?? ({} as LiveStation),
);

export const getCurrentStationSimilars = createSelector(
  getCurrentStation,
  (station): Array<string> => station?.similars ?? [],
);

export const makeLiveSelector = <
  K extends keyof LiveStation,
  F = LiveStation[K],
>(
  attr: K,
  fallback?: F,
) =>
  createSelector(
    getCurrentStation,
    station => station[attr] ?? (fallback as F),
  );

export const getStationLogo = createSelector(
  getCurrentStation,
  station => station?.logo,
);

export const getCurrentlySelectedCountry = createSelector(
  getCountryFilter,
  dropDownCountry => dropDownCountry,
);

export const getCurrentlySelectedCountryAbbrev = createSelector(
  getCurrentlySelectedCountry,
  country => country?.abbreviation,
);

export const getMarketOptions = createSelector(
  [getLiveRoot, getCurrentlySelectedCountryAbbrev],
  (live, country) => live?.marketOptions?.[country as string] ?? [],
);

export const getGenreOptions = createSelector(
  [getLiveRoot, getCurrentlySelectedCountryAbbrev],
  (live, country) => live?.genreOptions?.[country as string] ?? [],
);

export const getSeedId = makeLiveSelector('seedId');

export const getSeedType = makeLiveSelector('seedType');

export const getStationName = makeLiveSelector('stationName');

export const getCallLetters = makeLiveSelector('callLetters');

export const getAds = makeLiveSelector('ads', { enable_triton_token: false });

export const getFormat = makeLiveSelector('format');

export const getDescription = makeLiveSelector('description');

export const getGenres = makeLiveSelector('genres', []);

export const getMarkets = makeLiveSelector('markets', []);

export const getSiteId = makeLiveSelector('siteId');

export const getStationSite = makeLiveSelector('stationSite');

export const getUpcoming = makeLiveSelector('upcoming', []);

export const getLeads = makeLiveSelector('leads', []);

export const getUrl = makeLiveSelector('url');

type SocialNetwork = { key: string; link: string; name: string };

type SocialName =
  | 'facebook'
  | 'instagram'
  | 'pinterest'
  | 'snapchat'
  | 'tiktok'
  | 'twitter'
  | 'youtube';

export type StationContact = {
  networks?: Array<SocialNetwork>;
  request_phone_number: string;
  sms_number: string;
};

export const getSocial = createSelector<
  RootState,
  LiveStation | Record<string, unknown>,
  StationContact
>(getCurrentStation, ({ social }: any): StationContact => {
  if (!social) return {} as StationContact;

  function mapSocialNetworks(key: SocialName): SocialNetwork {
    return {
      facebook: {
        key,
        link: `https://www.facebook.com/${social[key]}`,
        name: 'Facebook',
      },
      instagram: {
        key,
        link: `https://www.instagram.com/${social[key]}`,
        name: 'Instagram',
      },
      pinterest: {
        key,
        link: `https://www.pinterest.com/${social[key]}`,
        name: 'Pinterest',
      },
      snapchat: {
        key,
        link: `https://www.snapchat.com/add/${social[key]}`,
        name: 'Snapchat',
      },
      tiktok: {
        key,
        link: `https://www.tiktok.com/@${social[key]}`,
        name: 'TikTok',
      },
      twitter: {
        key,
        link: `https://www.x.com/${social[key]}`,
        name: 'X',
      },
      youtube: {
        key,
        link: `https://www.youtube.com/user/${social[key]}`,
        name: 'YouTube',
      },
    }[key];
  }

  const networks = Object.keys(social)
    .reduce((mapped, key) => {
      if (social[key]) {
        return mapped.concat(mapSocialNetworks(key as SocialName));
      }
      return mapped;
    }, [] as Array<SocialNetwork>)
    .filter(identity);

  return {
    networks: networks.length > 0 ? networks : undefined,
    request_phone_number: social.request_phone_number,
    sms_number: social.sms_number,
  };
});

export const getLegalLinks = createSelector<
  RootState,
  LiveStation,
  LiveLegalLinks
>(getCurrentStation, ({ legalLinks }: LiveStation) => legalLinks);

export const getThumbs = makeLiveSelector('thumbs', {});

export const getIsFavorite = makeLiveSelector('favorite', false);

export const getFreq = makeLiveSelector('freq', '');

export const getBand = makeLiveSelector('band', '');

export const getWebsite = makeLiveSelector('website', '');

export const getId = makeLiveSelector('id');

export const getHasLocalSocial = createSelector<
  RootState,
  LiveStation,
  boolean
>(getCurrentStation, station => !!Object.keys(station?.social ?? {}).length);

export const getFeedId = createSelector(
  getCurrentStation,
  station => station?.feeds?.site_id,
);

const getOnAir = makeLiveSelector('nowOn', {} as Show);

export const getTimeline = makeLiveSelector('timeline', []);

export const getCurrentProvider = makeLiveSelector('provider', '');

export const getIsCurrentOwnedAndOperated = createSelector(
  getCurrentProvider,
  provider => provider?.toLowerCase().includes('clear channel'),
);

export const getRecentlyPlayedIds = makeLiveSelector('recentlyPlayed', []);

export const getRecentlyPlayedTracks = createSelector(
  getTracks,
  getRecentlyPlayedIds,
  (tracks, ids) =>
    uniq(ids)
      .map(id => tracks?.[String(id)] ?? ({} as Track))
      .filter(({ title }) => !!title)
      .slice(0, 3),
);

export const getOnAirThumbnail = createSelector(
  getOnAir,
  onAir => onAir?.destination?.thumbnail ?? '',
);

export const getOnAirTarget = createSelector(
  getOnAir,
  onAir => onAir?.destination?.href ?? '',
);

export const getOnAirStart = createSelector(
  getOnAir,
  onAir => onAir?.start ?? '',
);

export const getOnAirEnd = createSelector(getOnAir, onAir => onAir?.stop ?? '');

export const getTimeUntilShiftChange = createSelector(
  getOnAir,
  onAir => onAir?.timeUntilShiftChange,
);

export const getOnAirName = createSelector(
  getOnAir,
  onAir => onAir?.name ?? '',
);

export const getGenre = createSelector(getGenres, genres => genres?.[0] ?? {});

export const getGenreNames = createSelector(getGenres, genres =>
  genres.map(genre => genre.name),
);

export const getMarket = createSelector(
  getMarkets,
  markets => markets?.[0] ?? ({} as Market),
);

export const getCity = createSelector(getMarket, market => market?.city);

export const getStateAbbreviation = createSelector(
  getMarket,
  market => market?.stateAbbreviation,
);

export const getCountryAbbreviation = createSelector(
  getMarket,
  market => market?.countryAbbreviation,
);

export const getDefaultMarketId = createSelector(
  getLiveRoot,
  live => live?.defaults?.marketId,
);

export const getStationFromGenre = createSelector(
  getLiveStations,
  getCurrentGenreSparkStreamId,
  (stationList, id) => stationList?.[String(id)] ?? {},
);

export const getLiveStation = createSelector(
  getLiveStations,
  getStationId,
  (live, id) => live?.[String(id)] ?? ({} as LiveStation),
);

export const getIsFavoriteById = createSelector(
  getLiveStation,
  station => station?.favorite,
);

export const getStationNameById = createSelector(
  getLiveStation,
  station => station?.name ?? '',
);

export const getStationDescriptionById = createSelector(
  getLiveStation,
  station => station?.description ?? '',
);

export const getStationLogoById = createSelector(
  getLiveStation,
  station => station?.logo ?? '',
);

export const getProvider = createSelector(
  getLiveStation,
  station => station?.provider ?? '',
);

export const getIsOwnedAndOperated = createSelector(getProvider, provider =>
  provider?.toLowerCase().includes('clear channel'),
);
// todo: consider moving all path based methods to their own utility
export function makeLiveStationPath(
  stationName?: string,
  seedId?: number,
): string | null {
  return !stationName || !seedId ?
      null
    : joinPathComponents('/live/', slugify(stationName, seedId));
}
export function makeLiveDirectoryPath(
  countryCode: string | null,
  marketName: string | null,
  marketId: number | null,
  genreId?: number | null,
): string {
  return `${joinPathComponents(
    '/live/',
    ...(countryCode ? ['/country/', countryCode] : []),
    ...(countryCode && marketId ?
      ['/city/', slugify(marketName!.toLowerCase(), marketId)]
    : []),
  )}${genreId ? `?${qs.stringify({ genreId })}` : ''}`;
}

export const getLiveStationPath = createSelector(
  getStationName,
  getSeedId,
  makeLiveStationPath,
);

export const getLiveDirectoryPath = createSelector(
  getCountryFilterName,
  getMarketFilterName,
  getMarketId,
  getGenreId,
  makeLiveDirectoryPath,
);

export const getLiveMetaData = createSelector(
  getLiveRoot,
  live => live?.liveMeta ?? ({} as LiveMetaState),
);

export const getRelatedPodcasts = createSelector(
  getCurrentStation,
  getPodcasts,
  (station, podcasts) =>
    (station?.relatedPodcastIds ?? ([] as Array<string>)).reduce(
      (arr: Array<Podcast>, id) => {
        if (podcasts[id]) {
          arr.push(podcasts[id]);
        }
        return arr;
      },
      [],
    ),
);

export const getRelatedPlaylists = createSelector(
  getCurrentStation,
  getPlaylists,
  (station, playlists) => {
    const relatedPlaylists = (
      station?.relatedPlaylistIds ?? ([] as Array<string>)
    ).reduce((arr: Array<Playlist>, id) => {
      const lookupKey = id.replace('::', '/');
      if (playlists[lookupKey]) {
        arr.push(playlists[lookupKey]);
      }
      return arr;
    }, []);
    return relatedPlaylists;
  },
);
