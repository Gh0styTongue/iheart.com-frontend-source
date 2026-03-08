import composeRequest, {
  authHeaders,
  method,
  query,
  urlTagged,
} from 'api/helpers';

export function getTracksByIds({
  ampUrl,
  ids,
}: {
  ampUrl: string;
  ids: Array<number | string>;
}) {
  const idString = Array.isArray(ids) ? ids.join(',') : ids;
  const request = composeRequest(
    method('get'),
    urlTagged`${{ ampUrl }}/api/v3/catalog/tracks/${{ trackIds: idString }}`,
  );

  return request();
}

export function getTrackByTrackId({
  ampUrl,
  trackId,
}: {
  ampUrl: string;
  trackId: number;
}) {
  return composeRequest(
    method('get'),
    urlTagged`${{ ampUrl }}/api/v1/catalog/getTrackByTrackId`,
    query({ trackId }),
  )();
}

export function getLyrics(lyricsId: string | number) {
  return composeRequest(
    method('get'),
    // WEB-10054 - 11/21/17 - AV
    // we proxy this request through our server, but instead of our server hitting itself we're flattening the proxy on the server side.
    // Proxy in fastly www/(non)prod/snippets/proxy
    __CLIENT__ ?
      urlTagged`/lyrics/${{ lyricsId }}.txt`
    : urlTagged`http://imgart.iheart.com/lyrics/${{ lyricsId }}.txt`,
  )();
}

export function getArtistTopTracks({
  ampUrl,
  artistId,
  limit = 10,
  offset = 0,
}: {
  ampUrl: string;
  artistId: string | number;
  limit: number;
  offset?: number;
}) {
  const request = composeRequest(
    method('get'),
    urlTagged`${{ ampUrl }}/api/v3/catalog/tracks/artist/${{ artistId }}`,
    query({ limit, offset }),
  );

  return request();
}

export function getUserThumbs({
  ampUrl,
  limit = 200,
  offset = 0,
  profileId,
  sessionId,
  sortBy = 'LAST_MODIFIED_DATE',
}: {
  ampUrl: string;
  limit?: number;
  offset?: number;
  profileId: number;
  sessionId: string | null;
  sortBy?: string;
}) {
  const request = composeRequest(
    method('get'),
    authHeaders(profileId, sessionId),
    urlTagged`${{ ampUrl }}/api/v2/playlists/${{ profileId }}/thumbs`,
    query({ limit, offset, sortBy }),
  );

  return request();
}
