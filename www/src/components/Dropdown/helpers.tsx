import ArtistDropdown from 'components/Dropdown/ArtistDropdown';
import LiveDropdown from 'components/Dropdown/LiveDropdown';
import PlaylistDropdown from 'components/Dropdown/PlaylistDropdown';
import PlaylistTypes from 'constants/playlistTypes';
import PodcastDropdown from 'components/Dropdown/PodcastDropdown';
import { isPlaylist } from 'state/Playlist/helpers';
import { REC_TYPE } from 'state/Recs/constants';
import { Station } from 'state/Stations/types';
import { STATION_TYPE } from 'constants/stationTypes';

export function getDropdown(
  followed: boolean | undefined,
  profileId: number | null,
  data: Station,
  recentlyPlayed?: boolean,
) {
  const {
    author,
    curated,
    deletable,
    favorite,
    name,
    ownerId,
    playlistId,
    recType,
    responseType,
    seedId,
    seedType,
    tileType,
    tracks,
    url,
    writeable,
  } = data;

  if (isPlaylist(seedType)) {
    const belongsToUser = String(profileId) === String(ownerId);

    return (
      <PlaylistDropdown
        canEditPlaylist={
          responseType !== REC_TYPE.CURATED &&
          seedType === STATION_TYPE.COLLECTION
        }
        curated={curated || responseType === REC_TYPE.CURATED}
        deletable={deletable && author !== 'iHeartRadio'}
        followed={followed}
        id={seedId}
        key={`dropdown-${playlistId}`}
        name={name}
        playlistId={playlistId}
        recentlyPlayed={recentlyPlayed}
        recType={recType}
        tileType={playlistId === PlaylistTypes.New4U ? null : tileType}
        tracks={tracks || []}
        url={url}
        userId={profileId}
        writeable={writeable && belongsToUser}
      />
    );
  }

  if (seedType === STATION_TYPE.ARTIST) {
    return (
      <ArtistDropdown
        artist={data}
        followed={favorite || followed}
        key={`artist-${seedId}`}
        recentlyPlayed={recentlyPlayed}
        tileType={tileType}
      />
    );
  }
  if (seedType === STATION_TYPE.LIVE) {
    return (
      <LiveDropdown
        key={`station-${seedId}`}
        name={name}
        recentlyPlayed={recentlyPlayed}
        seedId={seedId}
        seedType={seedType}
        tileType={tileType}
      />
    );
  }
  if (seedType === STATION_TYPE.PODCAST) {
    return (
      <PodcastDropdown
        followed={favorite || followed}
        key={`dropdown-${seedId}`}
        recentlyPlayed={recentlyPlayed}
        seedId={seedId}
        title={name}
      />
    );
  }
  return null;
}
