import composeRequest, { method, query, urlTagged } from 'api/helpers';

export default function getTracks(
  ampUrl: string,
  profileId: number,
  sessionId: string,
  stationId: number | string,
  reqTracks = 1,
) {
  return composeRequest(
    method('get'),
    urlTagged`${{ ampUrl }}/api/v1/radio/${{ profileId }}/${{
      stationId,
    }}/getTracks`,
    query({
      profileId,
      reqTracks,
      sessionId,
    }),
  )();
}
