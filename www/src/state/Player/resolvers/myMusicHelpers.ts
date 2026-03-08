import { get } from 'lodash-es';
import { getTrackById } from 'state/Tracks/selectors';
import { Store } from 'state/types';
import { Track } from 'state/Tracks/types';

export function buildMyMusicModel({
  stationId,
  store,
  trackId,
  tracks,
}: {
  stationId: number | string;
  store: Store;
  trackId?: number;
  tracks: Array<Track>;
}) {
  const { albumTitle, artistId, artistName, imageUrl } =
    tracks[0] || ({} as Partial<Track>);

  const nextTrackId = trackId || get(tracks[0], 'trackId');
  const track = getTrackById(store.getState(), { trackId: nextTrackId });

  return Promise.resolve({
    albumId: stationId,
    albumTitle,
    artistId,
    artistName,
    id: stationId,
    imageUrl,
    track,
    tracks,
  });
}
