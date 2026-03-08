import { slugify } from 'utils/string';

export function getArtistUrl(artistId: number, artistName: string) {
  if (!artistId) {
    return null;
  }

  return `/artist/${slugify(artistName)}-${artistId}/`;
}

export function getArtistAlbumsUrl(artistId: number, artistName: string) {
  if (!artistId) {
    return null;
  }

  return `${getArtistUrl(artistId, artistName)}albums/`;
}
