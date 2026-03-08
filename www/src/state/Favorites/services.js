import composeRequest, {
  authHeaders,
  formBody,
  header,
  method,
  options,
  query,
  urlTagged,
} from 'api/helpers';

export function getMyFavoritesStation(id, ampUrl, opts) {
  return composeRequest(
    method('get'),
    urlTagged`${{ ampUrl }}/api/v1/catalog/getFavoritesStationById`,
    query({ id }),
    options(opts),
  )();
}

// this endpoint is primarily for fetching the radioId (the hash as opposed to the seedId number) for a user with id seedId, but profileId should be the current user, whether or not it's their MFR that you're looking for
export function getFavoritesBySeedId({ ampUrl, profileId, sessionId, seedId }) {
  return composeRequest(
    method('get'),
    urlTagged`${{ ampUrl }}/api/v2/playlists/${{
      profileId,
    }}/FAVORITES/seedId/${{ seedId }}`,
    authHeaders(profileId, sessionId),
  )();
}

export function renameFavoritesRadio({
  ampUrl,
  profileId,
  stationId,
  sessionId,
  name,
}) {
  return composeRequest(
    method('post'),
    urlTagged`${{ ampUrl }}/api/v2/playlists/${{ profileId }}/FAVORITES/${{
      stationId,
    }}/rename`,
    authHeaders(profileId, sessionId),
    header('Content-Type', 'application/x-www-form-urlencoded'),
    header('Accept', 'application/json; charset=utf-8'),
    formBody({ name }),
  )();
}
