import getSongs from 'state/YourLibrary/getSongs';
import { buildMyMusicModel } from './myMusicHelpers';
import { Store } from 'redux';
import { Track } from 'state/Tracks/types';

export function myMusicSongResolver({
  stationId,
  store,
  trackId,
}: {
  stationId: number | string;
  store: Store;
  trackId?: number;
}): Promise<{
  tracks: Array<Track>;
}> {
  const state = store.getState();

  const tracks = getSongs.selectors.selectSongs(state);

  return buildMyMusicModel({ stationId, store, trackId, tracks });
}
