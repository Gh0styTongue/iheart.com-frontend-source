import { createStation } from 'state/Stations/actions';
import { getFavorites } from 'state/Favorites/selectors';
import { requestFavorites } from 'state/Favorites/actions';
import type { Station } from 'state/Favorites/types';
import type { StationTypeValue } from 'constants/stationTypes';
import type { Store } from 'state/types';

export function favoritesResolver({
  playedFrom,
  stationId,
  stationType,
  store,
}: {
  playedFrom: string;
  stationId: number | string;
  stationType: StationTypeValue;
  store: Store;
}): Promise<Station> {
  const numId = Number(stationId);
  const state = store.getState();
  const favorites = getFavorites(state);
  const current = favorites[numId];

  store.dispatch(createStation(stationType, stationId, playedFrom));

  if (!current) {
    return store
      .dispatch(requestFavorites(numId))
      .then(() => getFavorites(store.getState())[numId]);
  }

  return Promise.resolve(current);
}
