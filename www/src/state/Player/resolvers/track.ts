import { createStation } from 'state/Stations/actions';
import { getTrackById } from 'state/Tracks/selectors';
import { requestTracks } from 'state/Tracks/actions';
import { STATION_TYPE } from 'constants/stationTypes';
import { Store } from 'state/types';
import { Track } from 'state/Tracks/types';

export function trackResolver({
  stationId: trackId,
  playedFrom,
  store,
}: {
  playedFrom: string;
  stationId: number | string;
  stationType: string;
  store: Store;
}): Promise<Track & { id: number; stationId: number }> {
  const state = store.getState();
  const track = getTrackById(state, { trackId });

  if (!track || !Object.keys(track).length) {
    return store.dispatch(requestTracks([trackId])).then(() => {
      const receivedTrack = getTrackById(store.getState(), { trackId });
      const { artistId } = receivedTrack;

      return store
        .dispatch(createStation(STATION_TYPE.ARTIST, artistId, playedFrom))
        .then(station => ({
          ...receivedTrack,
          id: station.id,
          stationId: station.id,
        }));
    });
  }

  return store
    .dispatch(createStation(STATION_TYPE.ARTIST, track.artistId, playedFrom))
    .then(station => ({
      ...track,
      id: station.id,
      stationId: station.id,
    }));
}
