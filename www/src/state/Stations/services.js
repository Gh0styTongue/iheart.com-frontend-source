import composeRequest, {
  authHeaders,
  formBody,
  header,
  method,
  query,
  urlTagged,
} from 'api/helpers';
import { decodePlaylistSeedId, isPlaylist } from 'state/Playlist/helpers';
import { getStationTypeForThumbs } from './helpers';
import { SENTIMENT_MAP } from './constants';
import { STATION_TYPE } from 'constants/stationTypes';

const TYPES = {
  custom: 'RADIO',
  featured: 'FEATUREDSTATION',
};

export function getUserStations(ampUrl, profileId, sessionId, userId, params) {
  return composeRequest(
    method('get'),
    authHeaders(profileId, sessionId),
    urlTagged`${{ ampUrl }}/api/v2/playlists/${{ userId }}`,
    query(params),
  )();
}

export function postThumbs({
  profileId,
  sessionId,
  stationId,
  trackId,
  sentiment,
  ampUrl,
  stationType,
}) {
  const thumbsEndpoint = getStationTypeForThumbs(stationType, sentiment);
  let taggedUrl;
  let payload;
  if (sentiment === 0) {
    taggedUrl = urlTagged`${{ ampUrl }}/api/v2/playlists/${{ profileId }}/${{
      thumbsEndpoint,
    }}/${{
      stationId,
    }}/${{ trackId }}/thumbs/reset`;
  } else {
    const thumbDirection = SENTIMENT_MAP[String(sentiment)];
    taggedUrl = urlTagged`${{ ampUrl }}/api/v2/playlists/${{
      profileId,
    }}/thumbs`;
    payload = {
      contentId: trackId,
      stationId,
      stationType: thumbsEndpoint,
      thumbDirection,
    };
  }
  return composeRequest(
    method('post'),
    authHeaders(profileId, sessionId),
    taggedUrl,
    formBody(payload),
  )();
}

export function createStation({
  profileId,
  sessionId,
  seedId,
  seedType,
  ampUrl,
  playedFrom = '',
  opts = {},
}) {
  const type =
    {
      custom: 'RADIO',
      featured: 'FEATUREDSTATION',
      'talk-show': 'TALKSHOW',
    }[seedType] || seedType.toUpperCase();
  return composeRequest(
    method('post'),
    authHeaders(profileId, sessionId),
    urlTagged`${{ ampUrl }}/api/v2/playlists/${{ profileId }}/${{
      stationType: type,
    }}/${{ seedId }}`,
    formBody({
      contentId: seedId,
      playedFrom,
      ...opts,
    }),
  )();
}

export function postFavorite({
  profileId,
  sessionId,
  stationId,
  ampUrl,
  seedType,
}) {
  return composeRequest(
    method('post'),
    urlTagged`${{ ampUrl }}/api/v2/playlists/${{ profileId }}/${{
      stationType: seedType.toUpperCase(),
    }}/${{ stationId }}`,
    authHeaders(profileId, sessionId),
    formBody({
      addToFavorites: true,
      contentId: stationId,
    }),
  )();
}

export function removeFavorite({
  profileId,
  sessionId,
  stationId,
  ampUrl,
  seedType,
}) {
  const type = seedType === STATION_TYPE.LIVE ? 'LR' : 'CR';
  return composeRequest(
    method('post'),
    urlTagged`${{ ampUrl }}/api/v2/profile/${{
      profileId,
    }}/favorites/station/${{
      stationType: type,
    }}/${{ stationId }}/delete`,
    authHeaders(profileId, sessionId),
  )();
}

export function getRecs({ ampUrl, profileId, sessionId, ...params }) {
  return composeRequest(
    method('get'),
    urlTagged`${{ ampUrl }}/api/v2/recs/${{ profileId }}`,
    authHeaders(profileId, sessionId),
    query(params),
  )();
}

export function deleteByTypeAndId({
  ampUrl,
  profileId,
  sessionId,
  stationType,
  stationId,
}) {
  const type = TYPES[stationType] || stationType.toUpperCase();

  if (isPlaylist(stationType)) {
    const { userId, playlistId } = decodePlaylistSeedId(stationId);

    return composeRequest(
      urlTagged`${{ ampUrl }}/api/v3/collection/user/${{
        userId,
      }}/recently-played/${{
        playlistId,
      }}`,
      method('delete'),
      authHeaders(profileId, sessionId),
      header('Accept', 'application/json'),
    )();
  }

  return composeRequest(
    method('post'),
    authHeaders(profileId, sessionId),
    urlTagged`${{ ampUrl }}/api/v2/playlists/${{ profileId }}/${{
      stationType: type,
    }}/${{
      stationId,
    }}/delete`,
  )();
}
