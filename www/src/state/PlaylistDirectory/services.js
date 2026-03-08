import composeRequest, {
  authHeaders,
  method,
  paramsSerializer,
  query,
  requestName,
  url,
  urlTagged,
} from 'api/helpers';
import qs from 'qs';

export function playlistDirectoryQuery({
  endpoint,
  country,
  collection,
  facets,
}) {
  return composeRequest(
    url(endpoint),
    requestName('playlistDirectoryQuery'),
    method('get'),
    query({
      collection,
      country,
      facets,
    }),
    paramsSerializer(search => qs.stringify(search, { skipNulls: true })),
  )();
}

export function getMadeForYouRecs({
  ampUrl,
  profileId,
  sessionId,
  includePersonalized,
}) {
  return composeRequest(
    method('get'),
    urlTagged`${{ ampUrl }}/api/v3/recs/madeForYouRecs`,
    authHeaders(profileId, sessionId),
    query({ includePersonalized }),
  )();
}
