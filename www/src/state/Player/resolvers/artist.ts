import { Artist } from 'state/Artists/types';
import { createStation } from 'state/Stations/actions';
import { getArtist, getArtistAdGenre } from 'state/Artists/selectors';
import { requestArtist, requestArtistAdGenre } from 'state/Artists/actions';
import { STATION_TYPE } from 'constants/stationTypes';
import type { Store } from 'state/types';

export function artistResolver({
  partialLoad,
  playedFrom,
  stationId,
  store,
}: {
  partialLoad: boolean;
  playedFrom: string;
  stationId: number | string;
  store: Store;
}): Promise<Artist> {
  const artistId = Number(stationId);
  const state = store.getState();
  const artist = getArtist(state, { artistId });
  const adGenre = getArtistAdGenre(state, { artistId });
  const promises = [];

  /**
   * If we are just loading the station into the player (partialLoad), we do
   * not need to make the call to retrieve the streaming data; otherwise, we
   * hit amp and they record the station as being listened to and it is saved
   * to the user's listening history.
   */
  if (!partialLoad) {
    promises.push(
      store.dispatch(createStation(STATION_TYPE.ARTIST, artistId, playedFrom)),
    );
  }

  if (!artist) promises.push(store.dispatch(requestArtist(artistId)));
  if (!adGenre) promises.push(store.dispatch(requestArtistAdGenre(artistId)));

  return Promise.all(promises).then(() =>
    getArtist(store.getState(), { artistId }),
  );
}
