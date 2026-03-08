import { Filters, Genre, LiveMetaState, LiveStation, State } from './types';
import { merge, set, setWith } from 'lodash-es';
import { receiveStations } from './helpers';
import { STATION_TYPE } from 'constants/stationTypes';
import type { HighlightsMetadata } from 'api/highlights';
import type { Market } from 'state/Location/types';

export function setCountry(state: State, payload: State) {
  const selectedMarketCountryId = state?.filters?.market?.countryId ?? null;
  return merge({}, state, {
    filters: {
      country: payload,
      genre: state?.filters?.genre,
      market:
        selectedMarketCountryId === payload.id ? state?.filters?.market : null,
    },
  });
}

export function setMarket(state: State, payload: Market): State {
  return merge({}, state, set({}, ['filters', 'market'], payload));
}

export function setGenre(state: State, payload: Genre): State {
  return merge({}, state, set({}, ['filters', 'genre'], payload));
}

export function setHighlightsMetadata(
  state: State,
  payload: HighlightsMetadata | null,
): State {
  return {
    ...state,
    highlightsMetadata: payload,
  };
}

export function setCountryOptions(
  state: State,
  payload: Array<Location>,
): State {
  return merge({}, state, { countryOptions: payload });
}

export function setMarketAndGenreOptions(
  state: State,
  payload: {
    genreOptions: Array<Genre>;
    marketOptions: Array<Market>;
    targetCountryName: string;
  },
): State {
  const { genreOptions, marketOptions, targetCountryName } = payload;
  // TODO move to location reducer https://jira.ihrint.com/browse/WEB-10044
  return {
    ...state,
    genreOptions: {
      ...(state?.genreOptions ?? {}),
      [targetCountryName]: [...genreOptions],
    },
    marketOptions: {
      ...(state?.marketOptions ?? {}),
      [targetCountryName]: [...marketOptions],
    },
  };
}

export function requestStations(state: State) {
  return merge({}, state, { isRequestingStations: true });
}

export function receiveAllStationTypes(
  state: State,
  payload: Array<LiveStation>,
) {
  return receiveStations(
    state,
    payload.filter(s => s.stationType === 'LIVE'),
    {},
  );
}

export function receiveLiveStations(
  state: State,
  payload: {
    filters: Filters;
    stations: Array<LiveStation>;
  },
) {
  return receiveStations(
    merge({}, state, { isRequestingStations: false }),
    payload.stations,
    payload.filters,
  );
}

export const receiveSimilarLiveStations = (
  state: State,
  {
    similars,
    stationId,
  }: {
    similars: Array<string>;
    stationId: number;
  },
) =>
  merge(
    {},
    state,
    setWith({}, ['stations', String(stationId), 'similars'], similars, Object),
  );

export function receiveOneStation(state: State, payload: LiveStation) {
  return receiveStations(state, [payload]);
}

export function setRadioEditProfileData(
  state: State,
  {
    stationId,
    content,
  }: {
    content: any;
    stationId: number;
  },
) {
  return {
    ...state,
    stations: merge({}, state.stations, {
      [String(stationId)]: merge(state?.stations?.[String(stationId)] ?? {}, {
        id: stationId,
        ...content,
      }),
    }),
  };
}

export function setLastPlayedDate(
  state: State,
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
  return seedType === STATION_TYPE.LIVE ?
      merge(
        {},
        state,
        setWith(
          {},
          ['stations', String(seedId), 'lastPlayedDate'],
          timestamp,
          Object,
        ),
      )
    : state;
}

export function saveStation(state: State, payload: any) {
  const {
    seedType,
    seedId,
    data: { lastPlayedDate },
  } = payload;
  return seedType === STATION_TYPE.LIVE ?
      merge(
        {},
        state,
        setWith(
          {},
          ['stations', String(seedId), 'lastPlayedDate'],
          lastPlayedDate,
          Object,
        ),
      )
    : state;
}

export function setRecentlyPlayed(
  state: State,
  {
    tracks,
    seedId,
  }: {
    seedId: number;
    tracks: Array<number>;
  },
) {
  return merge(
    {},
    state,
    setWith({}, ['stations', String(seedId), 'recentlyPlayed'], tracks, Object),
  );
}

export function updateThumbs(
  state: State,
  {
    trackId,
    sentiment,
    stationType,
    stationId,
  }: {
    sentiment: boolean;
    stationId: number;
    stationType: string;
    trackId: number;
  },
) {
  if (stationType === STATION_TYPE.LIVE) {
    return merge(
      {},
      state,
      setWith(
        {},
        ['stations', String(stationId), 'thumbs', String(trackId)],
        sentiment,
        Object,
      ),
    );
  }

  return state;
}

export function setIsFavorite(
  state: State,
  {
    stationId,
    isFavorite,
  }: {
    isFavorite: boolean;
    stationId: number;
  },
) {
  return merge(
    {},
    state,
    setWith(
      {},
      ['stations', String(stationId), 'favorite'],
      isFavorite,
      Object,
    ),
  );
}

export function removeStationFromHistory(
  state: State,
  {
    seedId,
    stationType,
  }: {
    seedId: number;
    stationType: string;
  },
) {
  if (stationType !== STATION_TYPE.LIVE) return state;

  return merge(
    {},
    state,
    setWith({}, ['stations', String(seedId), 'lastPlayedDate'], null, Object),
  );
}

export function setLiveMetaData(
  state: State,
  {
    didPostMetaData,
    metaData,
  }: {
    didPostMetaData: boolean;
    metaData: LiveMetaState;
  },
) {
  return {
    ...state,
    liveMeta: didPostMetaData ? metaData : merge({}, state.liveMeta, metaData),
  };
}
