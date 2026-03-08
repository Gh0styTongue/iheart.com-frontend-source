import composeRequest, {
  authHeaders,
  body,
  header,
  method,
  query as queryHelper,
  urlTagged,
} from 'api/helpers';
import getPowerAmpUrl from 'utils/hacks/getPowerAmpUrl';
import { AxiosRequestConfig } from 'axios';
import { identity } from 'lodash-es';

export type Payload<T> = Readonly<{
  data: Array<T>;
  links?: {
    next: string;
    nextPageKey: string;
  };
}>;

export function createMyMusicCollection({
  profileId,
  sessionId,
  name,
  tracks,
}: {
  name: string;
  profileId: number | null;
  sessionId: string | null;
  tracks: Array<number>;
}): AxiosRequestConfig {
  return composeRequest(
    authHeaders(profileId, sessionId),
    body({ name, tracks }),
    header('Accept', 'application/json'),
    header('Content-Type', 'application/json'),
    method('post'),
    urlTagged`${{ ampUrl: getPowerAmpUrl() }}collection/user/${{
      profileId: String(profileId),
    }}/collection`,
  )();
}

export function getMyMusicAlbums({
  key,
  limit,
  profileId,
  sessionId,
}: {
  key: string | null | undefined;
  limit: number;
  profileId: number | null;
  sessionId: string | null;
}): AxiosRequestConfig {
  return composeRequest(
    authHeaders(profileId, sessionId),
    header('Accept', 'application/json'),
    method('get'),
    urlTagged`${{ ampUrl: getPowerAmpUrl() }}collection/user/${{
      profileId: String(profileId),
    }}/mymusic/albums`,
    queryHelper({
      limit,
    }),
    key ? queryHelper({ pageKey: key }) : identity,
  )();
}

export function getMyMusicArtists({
  key,
  limit,
  profileId,
  sessionId,
}: {
  key: string | null | undefined;
  limit: number;
  profileId: number | null;
  sessionId: string | null;
}): AxiosRequestConfig {
  return composeRequest(
    authHeaders(profileId, sessionId),
    header('Accept', 'application/json'),
    method('get'),
    urlTagged`${{ ampUrl: getPowerAmpUrl() }}collection/user/${{
      profileId: String(profileId),
    }}/mymusic/artists`,
    queryHelper({
      limit,
    }),
    key ? queryHelper({ pageKey: key }) : identity,
  )();
}

export function getMyMusicCollections({
  limit,
  pageKey,
  profileId,
  sessionId,
  includePersonalized,
}: {
  limit?: number;
  pageKey?: string | null;
  profileId: number | null;
  sessionId: string | null;
  includePersonalized: boolean | null;
}): AxiosRequestConfig {
  return composeRequest(
    authHeaders(profileId, sessionId),
    header('Accept', 'application/vnd.iheart+json; version=3.1'),
    method('get'),
    urlTagged`${{ ampUrl: getPowerAmpUrl() }}collection/user/${{
      profileId: String(profileId),
    }}/collection`,
    queryHelper({ limit, pageKey, includePersonalized }),
  )();
}

export function removeMyMusicCollection({
  profileId,
  sessionId,
  userId,
  id,
}: {
  id: string;
  profileId: number | null;
  sessionId: string | null;
  userId: number;
}): AxiosRequestConfig {
  return composeRequest(
    authHeaders(profileId, sessionId),
    header('Accept', 'application/json'),
    method('delete'),
    urlTagged`${{ ampUrl: getPowerAmpUrl() }}collection/user/${{
      userId: String(userId),
    }}/collection/${{ id }}`,
  )();
}
