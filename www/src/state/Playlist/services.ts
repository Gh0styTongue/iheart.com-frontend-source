import composeRequest, {
  authHeaders,
  body,
  header,
  method,
  query,
  urlTagged,
} from 'api/helpers';
import { identity } from 'lodash-es';

type Args = {
  ampUrl: string;
  playlistId: string;
  playlistUserId: number | null;
  profileId: number | null;
  sessionId: string | null;
  tracks?: Array<number>;
  updateData?: any;
};

export function followPlaylist({
  ampUrl,
  profileId,
  sessionId,
  playlistUserId,
  playlistId,
}: Args) {
  return composeRequest(
    method('put'),
    urlTagged`${{ ampUrl }}/api/v3/collection/user/${{
      playlistUserId: String(playlistUserId),
    }}/collection/${{
      playlistId,
    }}/followers`,
    authHeaders(profileId, sessionId),
    header('Accept', 'application/json'),
  )();
}

export function unfollowPlaylist({
  ampUrl,
  profileId,
  sessionId,
  playlistUserId,
  playlistId,
}: Args) {
  return composeRequest(
    method('delete'),
    urlTagged`${{ ampUrl }}/api/v3/collection/user/${{
      playlistUserId: String(playlistUserId),
    }}/collection/${{
      playlistId,
    }}/followers`,
    authHeaders(profileId, sessionId),
    header('Accept', 'application/json'),
  )();
}

export function getPlaylist({
  profileId,
  sessionId,
  playlistUserId,
  playlistId,
  ampUrl,
}: Args) {
  const hasCredentials = !!profileId && !!sessionId;
  return composeRequest(
    method('get'),
    urlTagged`${{ ampUrl }}/api/v3/collection/user/${{
      playlistUserId: String(playlistUserId),
    }}/collection/${{
      playlistId,
    }}`,
    header('Accept', 'application/json'),
    hasCredentials ? authHeaders(profileId, sessionId) : identity,
  )();
}

export function deleteTracksFromPlaylist({
  profileId,
  sessionId,
  playlistUserId,
  playlistId,
  ampUrl,
  trackIds,
}: {
  ampUrl: string;
  playlistId: string;
  playlistUserId: string | number;
  profileId: number | null;
  sessionId: string | null;
  trackIds: Array<number>;
}) {
  return composeRequest(
    urlTagged`${{ ampUrl }}/api/v3/collection/user/${{
      playlistUserId: String(playlistUserId),
    }}/collection/${{
      playlistId,
    }}/tracks`,
    method('delete'),
    authHeaders(profileId, sessionId),
    header('Accept', 'application/json'),
    header('Content-Type', 'application/json'),
    body({ tracks: trackIds }),
  )();
}

export function removePlaylist({
  profileId,
  sessionId,
  playlistUserId,
  playlistId,
  ampUrl,
}: Args) {
  return composeRequest(
    urlTagged`${{ ampUrl }}/api/v3/collection/user/${{
      playlistUserId: String(playlistUserId),
    }}/collection/${{
      playlistId,
    }}`,
    method('delete'),
    authHeaders(profileId, sessionId),
    header('Accept', 'application/json'),
  )();
}

export function addTracksToPlaylist({
  profileId,
  sessionId,
  playlistUserId,
  playlistId,
  tracks,
  ampUrl,
}: Args) {
  return composeRequest(
    urlTagged`${{ ampUrl }}/api/v3/collection/user/${{
      playlistUserId: String(playlistUserId),
    }}/collection/${{
      playlistId,
    }}/tracks`,
    method('put'),
    authHeaders(profileId, sessionId),
    header('Accept', 'application/json'),
    header('Content-Type', 'application/json'),
    body({ tracks }),
  )();
}

export function updatePlaylist({
  profileId,
  sessionId,
  playlistUserId,
  playlistId,
  updateData,
  ampUrl,
}: Args) {
  return composeRequest(
    urlTagged`${{ ampUrl }}/api/v3/collection/user/${{
      playlistUserId: String(playlistUserId),
    }}/collection/${{
      playlistId,
    }}`,
    method('put'),
    authHeaders(profileId, sessionId),
    header('Accept', 'application/json'),
    header('Content-Type', 'application/json'),
    body(updateData),
  )();
}

export function getUserPlaylists({
  profileId,
  sessionId,
  ampUrl,
  limit = 50,
}: {
  ampUrl: string;
  limit: number;
  profileId: number | null;
  sessionId: string | null;
}) {
  return composeRequest(
    method('get'),
    urlTagged`${{ ampUrl }}/api/v3/collection/user/${{
      profileId: String(profileId),
    }}/collection`,
    header('Accept', 'application/json'),
    authHeaders(profileId, sessionId),
    query({ limit }),
  )();
}

export function getPlaylistRecs({
  ampUrl,
  profileId,
  sessionId,
  includePersonalized,
}: {
  ampUrl: string;
  profileId: number;
  sessionId: string;
  includePersonalized: boolean;
}) {
  return composeRequest(
    method('get'),
    urlTagged`${{ ampUrl }}/api/v3/recs/playlistRecs`,
    authHeaders(profileId, sessionId),
    query({ includePersonalized }),
  )();
}
