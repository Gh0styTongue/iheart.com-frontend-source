import composeRequest, {
  authHeaders,
  body,
  formBody,
  method,
  urlTagged,
} from 'api/helpers';
import { pickBy } from 'lodash-es';
import { STATION_TYPE, StationTypeValue } from 'constants/stationTypes';

export function legacyStreamStartedOne({
  ampUrl,
  payload,
}: {
  ampUrl: string;
  payload: any;
}) {
  return composeRequest(
    urlTagged`${{ ampUrl }}/api/v1/subscription/reportStreamOne`,
    method('post'),
    formBody({
      ...payload,
      playedDate: Date.now(),
    }),
  )();
}

export function legacyStreamStartedTwo({
  ampUrl,
  payload,
}: {
  ampUrl: string;
  payload: any;
}) {
  return composeRequest(
    urlTagged`${{ ampUrl }}/api/v1/subscription/reportStreamTwo`,
    method('post'),
    formBody({
      ...payload,
      ...pickBy(
        {
          featuredStationId: payload.seedFeaturedId,
          seedArtistId: payload.seedArtistId,
          seedShowId: payload.seedShowId,
          seedTrackId: payload.seedTrackId,
        },
        Boolean,
      ),
      playedDate: Date.now(),
      returnUserInfo: false,
    }),
  )();
}

export function legacyStreamDone({ ampUrl }: { ampUrl: string }) {
  return composeRequest(
    urlTagged`${{ ampUrl }}/api/v1/subscription/reportStreamDone`,
    method('post'),
  )();
}

export function postAds({
  stationId,
  playedFrom,
  profileId,
  sessionId,
  stationType,
  ampUrl,
  host,
}: {
  ampUrl: string;
  host: string;
  playedFrom: number;
  profileId: number;
  sessionId: string;
  stationId: string | number;
  stationType: string;
}) {
  return composeRequest(
    urlTagged`${{ ampUrl }}/api/v2/playback/ads`,
    method('post'),
    body({
      host,
      includeStreamTargeting: true,
      playedFrom,
      stationId,
      stationType,
    }),
    authHeaders(profileId, sessionId),
  )();
}

export function postReport({
  profileId,
  sessionId,
  ampUrl,
  reportPayload,
  stationId,
  offline = false,
  playerKey,
  reason,
  replay = false,
  secondsPlayed = 0,
  status,
  modes,
}: {
  ampUrl: string;
  modes: Array<'SHUFFLE' | 'REPLAY'>;
  offline: boolean;
  playerKey: string;
  profileId: number;
  reason: string;
  replay: boolean;
  reportPayload: string;
  secondsPlayed: number;
  sessionId: string;
  stationId: number | string;
  status: string;
}) {
  if (!reportPayload && !playerKey && !stationId) {
    throw new Error(
      'reportPayload, playerKey or stationId is required when reporting.',
    );
  }

  return composeRequest(
    urlTagged`${{ ampUrl }}/api/v3/playback/reporting`,
    method('post'),
    body({
      modes,
      offline,
      playedDate: Date.now(),
      playerKey: reportPayload || !playerKey ? undefined : playerKey, // (optional) - used by tracks fetched using the legacy endpoint
      reason,
      replay,
      reportPayload, // (optional) - used by tracks fetched using the playback/streams endpoint
      secondsPlayed,
      stationId: `${stationId}`,
      status,
    }),
    authHeaders(profileId, sessionId),
  )();
}

export function postStreams({
  ampUrl,
  host,
  playedFrom,
  profileId,
  seedInfo = {},
  sessionId,
  stationId,
  stationType,
  trackIds,
}: {
  ampUrl: string;
  host: string;
  playedFrom: number;
  profileId: number;
  seedInfo?: {
    id?: number;
    type?: StationTypeValue;
  };
  sessionId: string;
  stationId: number | string;
  stationType: 'ALBUM' | 'COLLECTION' | 'MYMUSIC' | 'RADIO' | 'PODCAST';
  trackIds: Array<number>;
}) {
  const { type: seedType, id: trackId } = seedInfo;

  return composeRequest(
    urlTagged`${{ ampUrl }}/api/v2/playback/streams`,
    method('post'),
    body({
      contentIds: trackIds,
      hostName: host,
      playedFrom,
      stationId,
      stationType,
      ...(seedType === STATION_TYPE.TRACK && trackId ?
        {
          startStream: {
            contentId: trackId,
            reason: 'SONG2START',
          },
        }
      : {}),
      ...(seedType === STATION_TYPE.ARTIST ?
        {
          startStream: {
            reason: 'ARTIST2START',
          },
        }
      : {}),
    }),
    authHeaders(profileId, sessionId),
  )();
}

export function setActiveStreamer({
  ampUrl,
  profileId,
  sessionId,
}: {
  ampUrl: string;
  profileId: string;
  sessionId: string;
}) {
  return composeRequest(
    authHeaders(profileId, sessionId),
    method('post'),
    urlTagged`${{ ampUrl }}/api/v3/session/setActiveStreamer`,
  )();
}
