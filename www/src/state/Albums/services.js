import composeRequest, { method, query, urlTagged } from 'api/helpers';

export function getAlbumByAlbumId({
  ampUrl,
  albumId,
  startIndex = 0,
  maxRows = 1,
}) {
  return composeRequest(
    method('get'),
    urlTagged`${{ ampUrl }}/api/v1/catalog/getAlbumsByAlbumIds`,
    query({ albumId, maxRows, startIndex }),
  )();
}

export function getAlbumByIdV3({ ampUrl, albumId }) {
  return composeRequest(
    method('get'),
    urlTagged`${{ ampUrl }}/api/v3/catalog/album/${{ albumId }}`,
  )();
}

export function getArtistAlbums({ ampUrl, id, next = undefined }) {
  return composeRequest(
    method('get'),
    urlTagged`${{ ampUrl }}/api/v3/catalog/artist/${{ artistId: id }}/albums`,
    query({ pageKey: next }),
  )();
}
