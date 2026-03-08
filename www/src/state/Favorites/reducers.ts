import { AmpStation, FavoritesStation, State, Station } from './types';
import { Artist } from 'state/Artists/types';
import { get, merge, unionBy } from 'lodash-es';
import { getFavoritesRadioName, mapStation } from './helpers';
import { Sentiment } from 'state/Stations/types';
import { STATION_TYPE, StationTypeValue } from 'constants/stationTypes';

export function receiveAllStationTypes(
  state: State,
  payload: Array<AmpStation>,
) {
  const favStations = payload.reduce((favorites, station) => {
    const {
      name = '',
      seedId,
      seedType,
      thumbsDown,
      thumbsUp,
      artists = [],
    } = station;
    let { hasMFR } = favorites as FavoritesStation;
    const stationId = station.id || (station as FavoritesStation).stationId;
    if (seedType === STATION_TYPE.FAVORITES) {
      let stationInfo = {};
      // if current user's mfr
      if (seedId === parseInt(get(state, 'seedId'), 10)) {
        hasMFR = true;
        stationInfo = {
          id: stationId,
          stationId,
          ...station,
          thumbs: merge(
            {},
            get(state, 'thumbs', {}),
            thumbsDown ?
              thumbsDown.reduce(
                (aggregate, id) => ({ ...aggregate, [id]: -1 }),
                {},
              )
            : {},
            thumbsUp ?
              thumbsUp.reduce(
                (aggregate, id) => ({ ...aggregate, [id]: 1 }),
                {},
              )
            : {},
          ),
        };
      }
      // else if someone else's mfr
      else {
        stationInfo = {
          ...station,
          artistIds: artists.map(artist => artist.artistId),
          name,
          seedType: STATION_TYPE.FAVORITES,
          username: name.split("'s")[0],
        };
      }
      // set hasMFR to true if current user has more than 1 favorite station
      return {
        ...favorites,
        hasMFR,
        [seedId]: stationInfo,
      };
    }
    return favorites;
  }, {});
  return Object.values(favStations).length > 0 ?
      merge({}, state, favStations)
    : state;
}

export function receiveSession(state: State, payload: { profileId: number }) {
  return merge({}, state, { seedId: payload.profileId });
}

export function setMyFavoriteRadio(
  state: State,
  {
    name = '',
    description,
    imagePath,
    link,
    seedId,
    slug,
    artists = [],
  }: {
    artists: Array<Artist>;
    description: string;
    imagePath: string;
    link: string;
    name: string;
    seedId: number;
    slug: string;
  },
): State {
  return merge({}, state, {
    [seedId]: {
      artistIds: artists.map(artist => artist.artistId),
      description,
      imagePath,
      link,
      name,
      seedId,
      seedType: STATION_TYPE.FAVORITES,
      slug,
      username: name.split("'s")[0],
    },
  });
}

export function setMyFavoriteRadioName(
  state: State,
  { name, profileId }: { name: 'string'; profileId: number },
) {
  if (name) return merge({}, state, { [profileId]: { name } });

  return state;
}

export function updateThumbs(
  state: State,
  {
    trackId,
    profileId,
    sentiment,
    stationType,
    stationId,
    seedId,
  }: {
    profileId: number;
    seedId: string;
    sentiment: Sentiment;
    stationId: string;
    stationType: StationTypeValue;
    trackId: string | number;
  },
) {
  if (
    stationType === STATION_TYPE.FAVORITES &&
    String(seedId) === String(get(state, 'seedId'))
  ) {
    const thumbs = get(state, 'thumbs', {});
    return merge({}, state, {
      [seedId]: { thumbs: { ...thumbs, [trackId]: sentiment } },
    });
  }

  const currentThumbsDown = get(state, [profileId, 'totalThumbsDown']);
  const favoritedTracks = get(state, [profileId, 'favoritedTracks']);

  if (sentiment === 1) {
    return merge({}, state, {
      [profileId]: {
        favoritedTracks: [
          {
            seedType: stationType,
            stationId,
            trackId,
          },
          ...favoritedTracks!,
        ],
      },
    });
  }

  const newFavoritedList = favoritedTracks!.filter(
    track =>
      get(track, 'trackId') !== Number(trackId) &&
      get(track, 'stationId') !== Number(stationId),
  );

  const newUserInfo = {
    ...state[profileId],
    favoritedTracks: newFavoritedList,
    totalThumbsDown: currentThumbsDown + Math.abs(sentiment),
  };

  const newState = {
    ...state,
    [profileId]: newUserInfo,
  };

  return newState;
}

export function receiveListenHistory(
  state: State,
  {
    stations: recentStations,
    userId,
  }: {
    stations: Array<Station>;
    userId: number;
  },
) {
  let totalThumbsDown = 0;
  let totalThumbsUp = 0;
  const favoritedTracks = recentStations.reduce(
    (tracks, station) => {
      const { thumbsUp = [], thumbsDown = [], seedType, id } = station;
      // calculate totals in the same reduce
      totalThumbsDown += thumbsDown.length;
      totalThumbsUp += thumbsUp.length;

      const mapped = thumbsUp.map(trackId => ({
        seedType,
        stationId: id,
        trackId,
      }));

      return tracks.concat(mapped);
    },
    [] as Array<{ seedType: string; stationId: string; trackId: string }>,
  );

  const currentStations = get(state, [userId, 'stations'], []);
  const stations = recentStations.map(mapStation);

  return merge({}, state, {
    [userId]: {
      favoritedTracks,
      stations: unionBy(currentStations, stations, 'seedId'),
      totalThumbsDown,
      totalThumbsUp,
    },
  });
}

export function setListenHistory(
  state: State,
  payload: {
    userId: number;
    station: { seedType: string; seedId: number; type: string };
  },
) {
  const currentStations = state[payload.userId]?.stations;
  const filteredStations =
    currentStations?.filter(s => s?.seedId !== payload.station.seedId) ?? []; // filter out matching ids

  return merge({}, state, {
    [String(payload.userId)]: {
      stations: [payload.station, ...filteredStations],
    },
  });
}

export function saveStation(state: State, payload: Record<string, any>) {
  const { seedType, seedId, data } = payload;
  const { name } = data;
  if (seedType === STATION_TYPE.FAVORITES) {
    const currFav = get(state, seedId);
    return merge({}, state, {
      [String(seedId)]: merge({}, currFav, {
        ...data,
        name: getFavoritesRadioName(name),
      }),
    });
  }
  return state;
}

export function setHasMFR(state: State, payload: boolean) {
  return merge({}, state, {
    hasMFR: payload,
  });
}
