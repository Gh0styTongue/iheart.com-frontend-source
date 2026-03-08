import transport from 'api/transport';
import { Events as ANALYTIC_EVENTS } from 'modules/Analytics';
import { Card } from 'state/Hero/actions';
import { CONTEXTS } from 'modules/Logger';
import {
  deferActionUntilAuthenticated,
  DEFERRABLE_ACTION_KEYS,
} from 'utils/deferActionUntilAuthenticated';
import { E as EVENTS } from 'shared/utils/Hub';
import { Genre } from 'state/Genres/types';
import { getAmpUrl, getHost } from 'state/Config/selectors';
import {
  getCredentials,
  getIsAnonymous,
  getProfileId,
  getSessionId,
} from 'state/Session/selectors';
import {
  getFilters,
  getIsFavoriteById,
  getLiveMetaData,
  getStationNameById,
  shouldRequestStations,
} from './selectors';
import { getFollowAnalyticsData } from 'modules/Analytics/legacyHelpers';
import { getGenres } from 'state/Genres/services';
import {
  getLiveReportingPayload,
  processMetaData,
  shouldPostMetaData,
  sortByName,
} from 'state/Live/helpers';
import {
  getLiveStationById,
  getNowPlaying,
  getSimilarLiveStations as getSimilarLiveStationsService,
  postLiveMetaData,
  stationQuery,
} from './services';
import { getMarketByLocationQuery } from 'state/Location/services';
import { getSearch } from 'state/SearchNew/selectors';
import { mapGenre } from 'state/Genres/shims';
import { mapNowPlayingTrack, mapStations } from './shims';
import { Market } from 'state/Location/types';
import { openSignupModal } from 'state/UI/actions';
import { postIsFavorite } from 'state/Stations/helpers';
import {
  RECEIVE_LIVE_META_DATA,
  RECEIVE_ONE_STATION,
  RECEIVE_SIMILAR_LIVE_STATIONS,
  RECEIVE_STATIONS,
  REJECT_STATIONS,
  REQUEST_SIMILAR_LIVE_STATIONS,
  REQUEST_STATIONS,
  SET_COUNTRY,
  SET_COUNTRY_OPTIONS,
  SET_GENRE,
  SET_HIGHLIGHTS_METADATA,
  SET_IS_FAVORITE,
  SET_MARKET,
  SET_MARKET_AND_GENRE_OPTIONS,
  SET_RE_PROFILE_DATA,
  SET_RECENTLY_PLAYED,
  SET_VIDEO_MAP_STATUS,
  SIMILAR_LIVE_STATIONS_ERROR,
} from './constants';
import { receivedTracks, requestTracks } from 'state/Tracks/actions';
import { STATION_TYPE } from 'constants/stationTypes';
import type {
  Country,
  Filters,
  LiveLegalLinks,
  LiveMetaData,
  LiveStation,
  LiveTrack,
  Show,
  Social,
  TimelineItem,
} from './types';
import type { HighlightsMetadata } from 'api/highlights';
import type { Thunk } from 'state/types';
import type { Track } from 'state/Tracks/types';

// WEB-11542 - AV - 8/21/18
// to give the playback refactor some breathing room we moved the meta data handling here
// unfortunately typing the rest of the file was out of scope and will be handled in https://jira.ihrint.com/browse/WEB-12089
// just a note, flow doesn't have ignoring for blocks (https://github.com/facebook/flow/issues/740),
// so we have to ignore every function definition (including anonymous) to make this all work.
export function setCountry(country: Country) {
  return {
    payload: country,
    type: SET_COUNTRY,
  };
}

export function setHighlightsMetadata(metadata: HighlightsMetadata | null) {
  return {
    payload: metadata,
    type: SET_HIGHLIGHTS_METADATA,
  };
}

export function setMarketAndGenreOptions(
  targetCountryName: string,
  marketOptions: Array<Market>,
  genreOptions: Array<Genre>,
) {
  return {
    payload: {
      genreOptions,
      marketOptions,
      targetCountryName,
    },
    type: SET_MARKET_AND_GENRE_OPTIONS,
  };
}

export function setCountryAndUpdateOptions(
  targetCountry: Country,
): Thunk<Promise<void>> {
  return (dispatch, getState) => {
    const state = getState();
    const baseUrl = getAmpUrl(state);
    const targetCountryName = targetCountry?.abbreviation;
    dispatch(setCountry(targetCountry));
    if (
      state?.live?.marketOptions?.[targetCountryName] &&
      state?.live?.genreOptions?.[targetCountryName]
    ) {
      return Promise.resolve();
    }
    return Promise.all([
      transport(
        getMarketByLocationQuery(
          { ampUrl: baseUrl },
          {
            // @ts-ignore
            country: targetCountryName.toUpperCase(),
            limit: 10000,
          },
        ),
      ),
      transport(getGenres({ ampUrl: baseUrl, genreType: 'liveStation' })),
    ]).then(([marketsRes, genresRes]) => {
      const markets = (marketsRes?.data?.hits ?? []).sort(sortByName);
      const genres = (genresRes?.data?.genres ?? [])
        .map(mapGenre)
        .sort(sortByName);
      dispatch(setMarketAndGenreOptions(targetCountryName, markets, genres));
    });
  };
}

export function setMarket(market: Market) {
  return {
    payload: market,
    type: SET_MARKET,
  };
}

export function setGenre(genre: Genre) {
  return {
    payload: genre,
    type: SET_GENRE,
  };
}

export function setCountryOptions(countryOptions: Array<Country>) {
  return {
    payload: countryOptions,
    type: SET_COUNTRY_OPTIONS,
  };
}

export function requestStations() {
  return { type: REQUEST_STATIONS };
}

export function receiveStations(
  stations: Array<LiveStation>,
  filters: Filters = {} as Filters,
  setResolveFlagForStations?: boolean,
) {
  return {
    payload: {
      filters,
      stations: mapStations(stations, setResolveFlagForStations),
    },
    type: RECEIVE_STATIONS,
  };
}

export function receiveOneStation(stationData: LiveStation) {
  return {
    payload: stationData,
    type: RECEIVE_ONE_STATION,
  };
}

export function rejectStations(error: Error) {
  return {
    error,
    type: REJECT_STATIONS,
  };
}

export const requestSimilarLiveStations = () => ({
  type: REQUEST_SIMILAR_LIVE_STATIONS,
});

export const similarLiveStationsError = (error: Error) => ({
  error,
  type: SIMILAR_LIVE_STATIONS_ERROR,
});

export const receiveSimilarLiveStations = (
  stationId: number,
  similars: Array<string>,
) => ({
  payload: {
    similars,
    stationId,
  },
  type: RECEIVE_SIMILAR_LIVE_STATIONS,
});

export const getSimilarLiveStations =
  (stationId: number): Thunk<Promise<void>> =>
  (dispatch, getState, { logger }) => {
    const ampUrl = getAmpUrl(getState());
    const host = getHost(getState());
    dispatch(requestSimilarLiveStations());

    return transport(
      getSimilarLiveStationsService({
        ampUrl,
        host,
        stationId,
      }),
    )
      .then(response => {
        const similarIds: Array<string> =
          response?.data?.recs?.liveRadioStationRecs ?? [];
        dispatch(receiveSimilarLiveStations(stationId, similarIds));
      })
      .catch(err => {
        const errObj = err instanceof Error ? err : new Error(err);
        logger.error([CONTEXTS.REDUX, CONTEXTS.LIVE], err, {}, errObj);
        dispatch(similarLiveStationsError(err));
      });
  };

export function requestAndLoadStations(): Thunk<Promise<void>> {
  return (dispatch, getState) => {
    const state = getState();
    if (shouldRequestStations(state)) {
      dispatch(requestStations());
      const filters = getFilters(state);
      return transport(
        stationQuery({ ampUrl: getAmpUrl(state), filters }),
      ).then(res => {
        const stations = res?.data?.hits ?? [];
        dispatch(receiveStations(stations, filters));
      });
    }
    return Promise.resolve();
  };
}

export function setNewMarket(market: Market): Thunk<Promise<[void, void]>> {
  return dispatch =>
    Promise.all([
      dispatch(setMarket(market)),
      dispatch(requestAndLoadStations()),
    ]);
}

export function setNewGenre(genre: Genre): Thunk<Promise<[void, void]>> {
  return dispatch =>
    Promise.all([
      dispatch(setGenre(genre)),
      dispatch(requestAndLoadStations()),
    ]);
}

export function setNewCountry(country: Country): Thunk<Promise<[void, void]>> {
  return dispatch =>
    Promise.all([
      dispatch(setCountryAndUpdateOptions(country)),
      dispatch(requestAndLoadStations()),
    ]);
}

export function setRecentlyPlayed(seedId: number, tracks: Array<number>) {
  return {
    payload: { seedId, tracks },
    type: SET_RECENTLY_PLAYED,
  };
}

export function requestRecentlyPlayed(seedId: number): Thunk<void> {
  return (dispatch, getState) => {
    const state = getState();
    const ampUrl = getAmpUrl(state);

    transport(getNowPlaying({ ampUrl, limit: 6, seedId })).then(
      ({ data }: { data: { data: Array<LiveTrack> } }) => {
        const rawTracks = data.data;
        if (rawTracks.length) {
          const validTracks = rawTracks.filter(({ trackId }) => trackId >= 0);
          const validIds = validTracks.map(({ trackId }) => trackId);
          const trackPlaceholders = validTracks.map(mapNowPlayingTrack);
          dispatch(requestTracks(validIds));
          dispatch(receivedTracks(trackPlaceholders as Array<Track>));
          dispatch(setRecentlyPlayed(seedId, validIds));
        } else {
          dispatch(setRecentlyPlayed(seedId, []));
        }
      },
    );
  };
}

export function requestSingleStation(id: string): Thunk<Promise<void>> {
  return (dispatch, getState, { logger }) => {
    const state = getState();
    return transport(getLiveStationById({ ampUrl: getAmpUrl(state), id }))
      .then(({ data }) => {
        dispatch(receiveStations(data.hits, undefined, true));
      })
      .catch((err: Error) => {
        logger.error([CONTEXTS.REDUX, CONTEXTS.LIVE], err.message, {}, err);
        dispatch(rejectStations(err));
      });
  };
}

export type RELiveProfilePayload = {
  content: {
    nowOn: Show;
    hero?: {
      image?: string;
      background?: string;
    };
    leads: Array<Card>;
    relatedPodcastIds?: Array<string>;
    relatedPlaylistIds?: Array<string>;
    social: Social;
    timeline: Array<TimelineItem>;
    upcoming: Array<Show>;
    legalLinks: LiveLegalLinks;
  };
  stationId: number;
};

export function setRELiveProfile(
  stationId: number,
  {
    current,
    leads,
    relatedPodcastIds,
    relatedPlaylistIds,
    social,
    timeline,
    upcoming,
    legalLinks,
  }: {
    current: Show;
    leads: Array<Card>;
    relatedPodcastIds?: Array<string>;
    relatedPlaylistIds?: Array<string>;
    social: Social;
    timeline: Array<TimelineItem>;
    upcoming: Array<Show>;
    legalLinks: LiveLegalLinks;
  },
): { payload: RELiveProfilePayload; type: string } {
  return {
    payload: {
      content: {
        leads,
        nowOn: current,
        relatedPodcastIds,
        relatedPlaylistIds,
        social,
        timeline,
        upcoming,
        legalLinks,
      },
      stationId,
    },
    type: SET_RE_PROFILE_DATA,
  };
}

export function setIsFavorite({
  stationId,
  isFavorite,
  stationName,
  queryId,
  view,
}: {
  stationId: string | number;
  isFavorite: boolean;
  stationName: string;
  queryId?: string;
  view?: { pageName: string; tab?: string };
}) {
  return {
    meta: {
      analytics: {
        data: getFollowAnalyticsData({
          followed: isFavorite,
          id: stationId,
          name: stationName,
          prefix: 'live',
          queryId,
          view,
        }),
        event: ANALYTIC_EVENTS.FollowUnfollow,
      },
      deferHub: true,
      hub: [{ event: EVENTS.FAVORITE_CHANGE }],
    },
    payload: { isFavorite, stationId },
    type: SET_IS_FAVORITE,
  };
}

export function toggleFavoriteStation({
  stationId,
  recentOnly = false,
  setTrueOnly = false,
  view,
}: {
  stationId: string | number;
  recentOnly?: boolean;
  setTrueOnly?: boolean;
  view?: { pageName: string; tab?: string };
}): Thunk<Promise<void>> {
  return (dispatch, getState, { logger }) => {
    const state = getState();
    const { profileId, sessionId } = getCredentials(state);
    const ampUrl = getAmpUrl(state);
    const wasFavorite =
      recentOnly ? true : getIsFavoriteById(state, { stationId });
    const stationName = getStationNameById(state, { stationId });
    const { queryId } = getSearch(state);

    if (setTrueOnly && wasFavorite) return Promise.resolve();

    if (getIsAnonymous(state) && !wasFavorite) {
      deferActionUntilAuthenticated(
        DEFERRABLE_ACTION_KEYS.LIVE_TOGGLE_FAVORITE,
        {
          recentOnly,
          setTrueOnly: true,
          stationId,
        },
      );

      return dispatch(openSignupModal({ context: 'live_favorite' }));
    }

    postIsFavorite({
      ampUrl,
      isFavorite: !wasFavorite,
      logger,
      profileId,
      seedType: STATION_TYPE.LIVE,
      sessionId,
      stationId,
      transport,
    });
    return dispatch(
      setIsFavorite({
        isFavorite: !wasFavorite,
        stationId,
        stationName,
        queryId,
        view,
      }),
    );
  };
}

export function receiveLiveMetaData(
  stationId: number,
  playedFrom: number,
  listenerId: string,
  data: LiveMetaData,
): Thunk<Promise<void>> {
  return async (dispatch, getState) => {
    const state = getState();
    const prevMetaData = getLiveMetaData(state);
    const [metaData, liveReportingParams] = processMetaData(
      data,
      stationId,
      listenerId,
    );
    const profileIdState = getProfileId(state);
    const profileId = profileIdState ? profileIdState.toString() : '';

    let didPostMetaData = false;
    if (shouldPostMetaData(prevMetaData, metaData)) {
      const liveReportingPayload = getLiveReportingPayload(
        metaData,
        liveReportingParams,
        {
          hostName: getHost(state),
          playedFrom,
          profileId,
        },
      );
      didPostMetaData = await !!transport(
        postLiveMetaData(liveReportingPayload, {
          ampUrl: getAmpUrl(state),
          profileId,
          sessionId: getSessionId(state) || '',
        }),
      );
    }

    return dispatch({
      payload: {
        didPostMetaData,
        metaData,
      },
      type: RECEIVE_LIVE_META_DATA,
    });
  };
}
