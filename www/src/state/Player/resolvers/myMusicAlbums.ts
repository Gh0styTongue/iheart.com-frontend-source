import getAlbumSongs from 'state/YourLibrary/getAlbumSongs';
import { buildMyMusicModel } from './myMusicHelpers';
import type { Store } from 'state/types';
import type { Track } from 'state/Tracks/types';

export function myMusicAlbumResolver({
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
  const tracks = getAlbumSongs.selectors.selectAlbumSongs(store.getState(), {
    albumId: stationId,
  });

  if (!tracks.length) {
    return store
      .dispatch(
        getAlbumSongs.action({
          albumId: Number(stationId),
        }),
      )
      .then(() =>
        buildMyMusicModel({
          stationId: Number(stationId),
          store,
          trackId,
          tracks: getAlbumSongs.selectors.selectAlbumSongs(store.getState(), {
            albumId: stationId,
          }),
        }),
      );
  }

  return buildMyMusicModel({
    stationId: Number(stationId),
    store,
    trackId,
    tracks,
  });
}
