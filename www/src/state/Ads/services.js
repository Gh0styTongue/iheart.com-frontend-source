import composeRequest, {
  authHeaders,
  body,
  method,
  query,
  urlTagged,
} from 'api/helpers';

export function adsMeta(ampUrl, id) {
  return composeRequest(
    method('get'),
    urlTagged`${{ ampUrl }}/api/v3/catalog/artists/${{
      artistId: id,
    }}/ads-meta`,
  )();
}

// for the moment this is only for playlists, but will eventually be used for all of our ads targetting
export function adsTargeting({ type, reportingKey, ampUrl }) {
  return composeRequest(
    method('get'),
    urlTagged`${{ ampUrl }}/api/v3/ads/targeting`,
    query({
      id: reportingKey,
      type,
    }),
  )();
}
export function fetchTritonSecureToken(
  ampUrl,
  { tritonUid, tfcdApplies, profileId, sessionId, providerId },
) {
  return composeRequest(
    method('post'),
    urlTagged`${{ ampUrl }}/api/v3/oauth/triton/token`,
    body({
      lsid: tritonUid,
      coppa: tfcdApplies ? 1 : 0,
      ...(providerId && { providerId }),
      // omid: __,
    }),
    authHeaders(profileId, sessionId),
  )();
}
