import { Album, Track as AlbumTrack } from 'state/Albums/types';
import { Artist } from 'state/Artists/types';
import { getAlbum } from 'state/Albums/selectors';
import { getAlbumPlaylist } from './shims';
import { getTrackById } from 'state/Tracks/selectors';
import { requestAlbum } from 'state/Albums/actions';
import { requestTracks } from 'state/Tracks/actions';
import { State } from 'state/types';
import { Store } from 'redux';
import { Track } from 'state/Tracks/types';

function getMissingTracks(state: State, tracks: Array<AlbumTrack> = []) {
  return tracks.reduce((missing: Array<number>, { id }) => {
    const track = getTrackById(state, { trackId: id });

    if (!Object.keys(track).length) return [...missing, id];

    return missing;
  }, []);
}

function buildAlbumModel(store: Store, album: Album) {
  const missingTracks = getMissingTracks(store.getState(), album.tracks);

  if (missingTracks.length) {
    return store.dispatch<any>(requestTracks(missingTracks)).then(() => ({
      ...album,
      playlist: getAlbumPlaylist(
        (album.tracks || []).map(({ id }) =>
          getTrackById(store.getState(), { trackId: id }),
        ),
      ),
    }));
  }

  const playlist = getAlbumPlaylist(album.tracks as Array<Track>);

  return Promise.resolve({
    ...album,
    playlist,
  });
}

export function albumResolver({
  stationId,
  store,
}: {
  stationId: number | string;
  store: Store;
}): Promise<Artist> {
  const albumId = Number(stationId);
  const album = getAlbum(store.getState(), { albumId });

  if (!album || !Object.keys(album).length) {
    return store
      .dispatch<any>(requestAlbum({ albumId }))
      .then(() =>
        buildAlbumModel(store, getAlbum(store.getState(), { albumId })),
      );
  }

  return buildAlbumModel(store, album);
}
