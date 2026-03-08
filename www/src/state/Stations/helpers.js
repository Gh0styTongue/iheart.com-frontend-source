import { CONTEXTS, STATION_TYPE_CONTEXT_MAP } from 'modules/Logger';
import { get } from 'lodash-es';
import {
  postFavorite,
  postThumbs,
  removeFavorite,
} from 'state/Stations/services';
import { stationTypeMap, THUMB_STRINGS } from './constants';

export function groupStationsByType(stations) {
  const output = {
    custom: [],
    live: [],
    playlist: [],
    podcast: [],
  };
  stations.forEach(station => {
    output[stationTypeMap[station.stationType]].push(station);
  });
  return output;
}

export function getThumbString(sentiment) {
  switch (sentiment) {
    case 1:
      return THUMB_STRINGS.UP;
    case -1:
      return THUMB_STRINGS.DOWN;
    default:
      return THUMB_STRINGS.UNTHUMB;
  }
}

export function getStationTypeForThumbs(stationType, sentiment) {
  let stationTypeForThumbs = stationType.toUpperCase();
  if (sentiment && stationType === 'playlistradio') {
    stationTypeForThumbs = 'COLLECTION';
  } else if (!sentiment && stationType !== 'live') {
    stationTypeForThumbs = 'RADIO';
  }
  return stationTypeForThumbs;
}

export function lastListenedSorter(stationA, stationB) {
  return (
    get(stationB, 'lastPlayedDate', -Infinity) -
    get(stationA, 'lastPlayedDate', -Infinity)
  );
}

export function postNewThumb({
  logger,
  profileId,
  sessionId,
  trackId,
  ampUrl,
  sentiment,
  stationId,
  transport,
  stationType,
}) {
  return transport(
    postThumbs({
      ampUrl,
      profileId,
      sentiment,
      sessionId,
      stationId,
      stationType,
      trackId,
    }),
  ).catch(e => {
    const errObj = e instanceof Error ? e : new Error(e.statusText ?? 'error');
    logger.error(
      [CONTEXTS.PLAYBACK, STATION_TYPE_CONTEXT_MAP[stationType]],
      errObj.message,
      {},
      errObj,
    );
  });
}

export function postIsFavorite({
  profileId,
  sessionId,
  ampUrl,
  isFavorite,
  logger,
  stationId,
  transport,
  seedType,
}) {
  const service = isFavorite ? postFavorite : removeFavorite;

  return transport(
    service({
      ampUrl,
      profileId,
      seedType,
      sessionId,
      stationId,
    }),
  ).catch(e => {
    const errObj = e instanceof Error ? e : new Error(e.statusText ?? 'error');
    logger.error(
      [CONTEXTS.PLAYBACK, STATION_TYPE_CONTEXT_MAP[seedType]],
      errObj.message,
      {},
      errObj,
    );
  });
}
