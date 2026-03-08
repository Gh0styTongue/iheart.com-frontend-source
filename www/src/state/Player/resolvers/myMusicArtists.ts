import getArtistSongs from 'state/YourLibrary/getArtistSongs';
import { buildMyMusicModel } from './myMusicHelpers';
import { Store } from 'state/types';
import { Track } from 'state/Tracks/types';

export function myMusicArtistsResolver({
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
  const tracks = getArtistSongs.selectors.selectArtistSongs(store.getState(), {
    artistId: stationId,
  });

  if (!tracks.length) {
    return store
      .dispatch(
        getArtistSongs.action({
          artistId: Number(stationId),
        }),
      )
      .then(() =>
        buildMyMusicModel({
          stationId: Number(stationId),
          store,
          trackId,
          tracks: getArtistSongs.selectors.selectArtistSongs(store.getState(), {
            artistId: stationId,
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
