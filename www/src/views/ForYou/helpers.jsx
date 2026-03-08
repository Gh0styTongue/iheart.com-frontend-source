import { decodePlaylistSeedId, isPlaylist } from 'state/Playlist/helpers';
import { isEqual } from 'lodash-es';

function areSameStation(station1, station2) {
  if (isPlaylist(station1.seedType) && isPlaylist(station2.seedType)) {
    const decoded1 = decodePlaylistSeedId(station1.seedId);
    const decoded2 = decodePlaylistSeedId(station2.seedId);
    // if one is missing a userId, just compare playlistIds
    if (!decoded1.userId || !decoded2.userId) {
      return decoded1.playlistId === decoded2.playlistId;
    }
    return isEqual(decoded1, decoded2);
  }
  if (station1.seedType !== station2.seedType) {
    return false;
  }
  return station1.seedId === station2.seedId;
}

export function listContainsStation(stationList, station) {
  return stationList.reduce(
    (found, otherStation) => found || areSameStation(station, otherStation),
    false,
  );
}
