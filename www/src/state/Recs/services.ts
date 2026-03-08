import composeRequest, {
  authHeaders,
  body,
  method,
  query,
  urlTagged,
} from 'api/helpers';

export function getGenreRecs({
  ampUrl,
  genreId,
  ops,
}: {
  ampUrl: string;
  genreId: number;
  ops?: {
    lat?: string;
    limit?: number;
    lng?: string;
    template?: string;
    zipCode?: string;
  };
}) {
  return composeRequest(
    method('get'),
    urlTagged`${{ ampUrl }}/api/v2/recs/genre`,
    query({
      genreId,
      ...ops,
    }),
  )();
}

export function suppressStations({
  ampUrl,
  profileId,
  sessionId,
  station,
}: {
  ampUrl: string;
  profileId: number;
  sessionId: string;
  station: {
    id: number;
    type: string;
    dlType?: string;
  };
}) {
  return composeRequest(
    method('post'),
    urlTagged`${{ ampUrl }}/api/v2/taste/${{
      profileId: String(profileId),
    }}/suppress/stations/add`,
    body({
      stations: [station],
    }),
    authHeaders(profileId, sessionId),
  )();
}
