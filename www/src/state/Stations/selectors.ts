import nameSorter from 'utils/nameSorter';
import { createSelector } from 'reselect';
import { get, uniqBy } from 'lodash-es';
import { getAlbums } from 'state/Albums/selectors';
import { getArtists } from 'state/Artists/selectors';
import {
  getCurrentFavorites,
  getFavoritesById,
} from 'state/Favorites/selectors';
import { getCurrentPath } from 'state/Routing/selectors';
import { getLiveStations } from 'state/Live/selectors';
import { getPlayerInteracted } from 'state/Player/selectors';
import { getPlaylistStations } from 'state/Playlist/selectors';
import { getPodcasts } from 'state/Podcast/selectors';
import { Selector } from 'state/types';
import { State, Station } from './types';
import { STATION_TYPE, StationTypeValue } from 'constants/stationTypes';

/*
  passing second and third arguments in a pojo so that
  createStructuredSelector can read these out of ownProps.
*/

const getters = {
  [STATION_TYPE.ALBUM]: getAlbums,
  [STATION_TYPE.COLLECTION]: getPlaylistStations,
  [STATION_TYPE.PLAYLIST_RADIO]: getPlaylistStations,
  [STATION_TYPE.LIVE]: getLiveStations,
  [STATION_TYPE.PODCAST]: getPodcasts,
  [STATION_TYPE.CUSTOM]: getArtists,
  [STATION_TYPE.ARTIST]: getArtists,
  [STATION_TYPE.TRACK]: getArtists,
  [STATION_TYPE.FEATURED]: getArtists,
  [STATION_TYPE.FAVORITES]: getCurrentFavorites,
};

export function getSeedTypeFromProps(
  _: State,
  { seedType }: { seedType: StationTypeValue },
): StationTypeValue {
  return seedType;
}
export function getSeedIdFromProps(
  _: State,
  { seedId }: { seedId: number | string },
): number | string {
  return seedId;
}

export function getStationTypeFromProps(
  _: State,
  { stationType }: { stationType: StationTypeValue },
): StationTypeValue {
  return stationType;
}
export function getStationIdFromProps(
  _: State,
  { stationId }: { stationId: number | string },
): number | string {
  return stationId;
}

// @ts-ignore
export const getStation: Selector<any> = createSelector(
  state => state,
  // @ts-ignore
  (_, { id, type }) => ({ id, type }),
  (state, { id, type }) => {
    const getter = getters[type];

    if (!getter) return null;
    return type === STATION_TYPE.FAVORITES ?
        getter(state)
      : (getter(state)[String(id)] ?? null);
  },
);

export const stationIsFavorite: Selector<boolean> = createSelector(
  getStation,
  station => {
    return station?.favorite ?? false;
  },
);

export function getTrackId(
  state: any,
  { trackId }: { trackId: number | string },
): number | string {
  return trackId;
}

export function getAllStations(state: any): Array<any> {
  return [
    Object.values(getArtists(state)),
    Object.values(getPlaylistStations(state)),
    Object.values(getPodcasts(state)),
    Object.values(getLiveStations(state)),
    // @ts-ignore
    [getCurrentFavorites(state)],
  ].reduce((all, stationMap) => all.concat(stationMap), []);
}

export function getListenHistory(state: any): Array<any> {
  const mfr = getCurrentFavorites(state);
  const { stations = [] } = mfr;

  return uniqBy(
    stations.reduce((acc: Array<any>, { seedId, type, seedType }: Station) => {
      if (seedType === 'favorites') {
        return [...acc, getFavoritesById(seedId as number)(state)];
      }

      const getter = getters[type];

      if (getter) return [...acc, get(getter(state), String(seedId), null)];
      return acc;
    }, []),
    'seedId',
  );
}

// jcollyer IHRWEB-14834
// this is used on the Home page and Genre Game page.
// We use it to tell weather to show the miniPlayer.
// So if the user has not interacted with the player, and is on route '/' or '/genre-options' they should NOT see the miniPlayer,
// otherwise they see the MiniPlayer.
export const getWelcome: Selector<boolean> = createSelector(
  getCurrentPath,
  getPlayerInteracted,
  (currentPath, playerInteracted) =>
    (currentPath === '/' || currentPath === '/genre-options/') &&
    !playerInteracted,
);

export function getFavoriteStations(state: any): Array<any> {
  return getAllStations(state).filter(station => get(station, 'favorite'));
}

export function getSavedStations(state: any): Array<any> {
  return getFavoriteStations(state).sort(nameSorter);
}

export function getStations(state: any): State {
  return get(state, 'stations', {});
}

export const getRequestingListenHistory: Selector<boolean> = createSelector(
  getStations,
  stations => get(stations, 'requestingListenHistory'),
);

export const getListenHistoryReceived: Selector<boolean> = createSelector(
  getStations,
  stations => get(stations, 'listenHistoryReceived'),
);

export function getSeedIdSeedTypeFromProps(
  state: any,
  { seedId, seedType }: { seedId: string; seedType: string },
): { seedId: string; seedType: string } {
  return { seedId, seedType };
}

// @ts-ignore
export const getIsFavoriteByTypeAndId: Selector<any> = createSelector(
  getFavoriteStations,
  getSeedIdSeedTypeFromProps,
  (stations, { seedId, seedType }) =>
    stations.some(
      station =>
        get(station, 'seedId') === seedId &&
        get(station, 'seedType') === seedType,
    ),
);

// if the station id is passed in via props use that and return early
// as opposed to doing an unnecesary look up which will resolve in the wrong station id
// @ts-ignore
export const getStationIdByTypeAndId: Selector<any> = createSelector(
  // @ts-ignore
  (_, props) => props.stationId,
  getAllStations,
  getSeedIdSeedTypeFromProps,
  (stationId, stations, { seedId, seedType }) => {
    if (stationId) return stationId;

    const current = stations.find(
      station =>
        get(station, 'seedId') === seedId &&
        get(station, 'seedType') === seedType,
    );

    return get(current, 'stationId');
  },
);

export const getTotalListenHistoryStations: Selector<boolean> = createSelector(
  getStations,
  stations => get(stations, 'totalListenHistoryStations'),
);

export const getRecentlyPlayedStations: Selector<Array<Station>> =
  createSelector(getListenHistory, listenHistory =>
    listenHistory
      .filter(track => track?.lastPlayedDate)
      .sort(
        (
          { lastPlayedDate: aLastPlayedDate },
          { lastPlayedDate: bLastPlayedDate },
        ) => {
          if (aLastPlayedDate > bLastPlayedDate) return -1;
          return 1;
        },
      ),
  );

export const getListenHistorySize: Selector<number> = createSelector(
  getListenHistory,
  listenHistory => listenHistory.length,
);
