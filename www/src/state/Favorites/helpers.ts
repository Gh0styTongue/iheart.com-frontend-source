import { encodePlaylistSeedId } from 'state/Playlist/helpers';
import { Station } from './types';

export function getFavoritesRadioName(name: string) {
  if (name.includes('Favorites Radio')) return name;
  return `${name} Favorites Radio`;
}

export function mapFavorites(data: Record<string, any>, id: number) {
  return {
    ...data.stations[0],
    name: getFavoritesRadioName(data.stations[0].name),
    seedId: id,
    seedType: 'favorites',
  };
}

export function mapStation(station: Station) {
  const { type, stationType, seedId, id, playlistId, ownerId, seedType } =
    station;
  let newSeedId = seedId;
  if (playlistId) newSeedId = encodePlaylistSeedId(ownerId, playlistId);
  if (stationType === 'PODCAST') newSeedId = parseInt(id, 10);

  return {
    seedId: newSeedId,
    seedType,
    type: (type || stationType).toLowerCase(),
  };
}
