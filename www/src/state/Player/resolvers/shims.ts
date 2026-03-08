import Media from 'web-player/models/Media';
import { STATION_TYPE } from 'constants/stationTypes';
import { Track } from 'state/Tracks/types';

export function getAlbumPlaylist(tracks?: Array<Track>): Array<any> {
  return (tracks || []).map(
    ({
      id,
      duration,
      imageUrl,
      artistName,
      artistId,
      albumName,
      title,
      albumId,
      playbackRights,
    }) =>
      new Media({
        album: albumName,
        albumId,
        artist: artistName,
        artistId,
        duration,
        imagePath: imageUrl,
        playbackRights,
        stationId: albumId,
        stationSeedId: albumId,
        stationSeedType: STATION_TYPE.ALBUM,
        title,
        trackId: id,
      }),
  );
}
