import { createStation } from 'state/Stations/actions';
import { getPlaylistStations } from 'state/Playlist/selectors';
import { PlaylistStation } from 'state/Playlist/types';
import { requestPlaylist } from 'state/Playlist/actions';
import { StationTypeValue } from 'constants/stationTypes';
import { Store } from 'state/types';

export function playlistResolver({
  stationId,
  playedFrom,
  store,
  stationType,
}: {
  playedFrom: string;
  stationId: number | string;
  stationType: StationTypeValue;
  store: Store;
}): Promise<PlaylistStation> {
  store.dispatch(createStation(stationType, stationId, playedFrom));

  const [playlistUserId, playlistId] = String(stationId).split('/');

  return store
    .dispatch(requestPlaylist({ playlistId, playlistUserId }))
    .then(() => getPlaylistStations(store.getState())[stationId]);
}
