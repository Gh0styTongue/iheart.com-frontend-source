import reduxFactory from 'state/factory';
import transport from 'api/transport';
import { getAmpUrl, getHost } from 'state/Config/selectors';
import { isModel } from 'utils/immutable';
import {
  legacyStreamDone,
  legacyStreamStartedOne,
  legacyStreamStartedTwo,
  postReport,
} from 'state/Player/services';
import { pick } from 'lodash-es';
import { reportStreamStarted } from 'state/Live/services';
import { STATION_TYPE } from 'constants/stationTypes';

const store = reduxFactory();

// PRIVATE

/**
 * usesReportingV3
 * playback/report is available for replay tracks and certain station types
 *
 * @param {any} type
 * @param {any} isReplay
 * @returns
 */
function usesReportingV3(type, isReplay) {
  return (
    isReplay ||
    [
      STATION_TYPE.ARTIST,
      STATION_TYPE.TRACK,
      STATION_TYPE.FEATURED,
      STATION_TYPE.MY_MUSIC,
      STATION_TYPE.COLLECTION,
      STATION_TYPE.PLAYLIST_RADIO,
      STATION_TYPE.ALBUM,
      STATION_TYPE.PODCAST,
      STATION_TYPE.FAVORITES,
    ].includes(type)
  );
}

/**
 * subscriptionPayloadMapper
 * maps data and auth keys to the format expected by the subscription report API
 *
 * @export
 * @param {any} {playerKey, id, stationId}
 * @param {any} {playedFrom, profileId, sessionId}
 * @returns object
 */
function subscriptionPayloadMapper(
  { playerKey, id, stationId },
  { playedFrom = 300, profileId, sessionId },
) {
  return {
    contentId: id,
    parentId: stationId,
    playedFrom,
    playerKey,
    profileId,
    radioStationId: stationId,
    sessionId,
  };
}

/**
 * @module
 * Reporting
 * Actions around AMP reporting API calls
 *
 */

const REPORT_ACTION = {
  APPCLOSE: 'APPCLOSE',
  DONE: 'DONE',
  ERROR: 'ERROR',
  REPLAY: 'REPLAY',
  REPORT_15: 'REPORT_15',
  REWIND: 'REWIND',
  SKIP: 'SKIP',
  START: 'START',
  STATIONCHANGE: 'STATIONCHANGE',
};

export const reportingV3TrackKeys = [
  'reported',
  'isReplay',
  'stationId',
  'stationSeedType',
  'id',
  'reportPayload',
  'reportingKey',
  'stationSeedId',
  'playerKey',
  'artistId',
];

/**
 * trackDataPicker
 * Selects a whitelist of keys from a track (Media) backbone model
 *
 * @export
 * @param {any} track
 * @param {any} [fields=reportingV3TrackKeys]
 * @returns
 */
export function trackDataPicker(track, fields = reportingV3TrackKeys) {
  if (!isModel(track)) return {};
  return pick(track.toJSON(), fields);
}

/**
 * reportingPermitted
 * Checks for certain default and custom conditions based on the `report` object
 *
 * @export
 * @param {any} track
 * @param {any} key
 * @param {boolean} [additionalTestFn=() => (true)]
 * @returns
 */
export function reportingPermitted(
  payload,
  track,
  key,
  additionalTestFn = () => true,
) {
  return new Promise((resolve, reject) => {
    if (!track) return reject(new Error('No Track'));
    if (!payload) return reject(new Error('No Payload'));

    const isMedia = track.get('isMedia');
    const reported = track.get('reported');
    const { data, auth } = payload;
    const { stationSeedType, stationId } = data;
    const { profileId, sessionId } = auth;

    if (!profileId || !sessionId)
      return reject(new Error('Missing credentials'));
    if (!stationSeedType) return reject(new Error('Missing stationSeedType'));
    if (!stationId) return reject(new Error('Missing stationId'));
    if (!isMedia) return reject(new Error('track is not Media'));
    if (reported[key]) return reject(new Error('Already reported'));
    if (!additionalTestFn()) return reject(new Error('Failed passed in test'));

    return resolve(payload);
  });
}

/**
 * reportV3
 * Maps data to a payload compatible with playback/report
 *
 * @export
 * @param {any} {
 *  status, isReplay, stationId, stationSeedType, playerKey, reportingKey,
 *  reportPayload, id, artistId, position = 0
 * }
 * @param {any} auth
 * @returns
 */
export function reportV3(
  {
    status,
    stationId,
    stationSeedType,
    playerKey,
    reportingKey,
    reportPayload,
    position = 0,
    shuffle = false,
    isReplay: replay,
  },
  auth,
) {
  // pass in modes (shuffle, replay, offline, etc) as an array of uppercased strings.
  const modeKeys = { replay, shuffle };
  const modes = Object.keys(modeKeys)
    .map(k => modeKeys[k] && k.toUpperCase())
    .filter(Boolean);

  return transport(
    postReport({
      ampUrl: getAmpUrl(store.getState()),
      modes,
      playerKey,
      replay,
      reportingKey,
      reportPayload,
      secondsPlayed: parseInt(position, 10),
      stationId: reportingKey || stationId,
      stationType: stationSeedType,
      status,
      ...auth,
    }),
  );
}

/**
 * reportStart
 * Calls the right reporting API once a track starts.
 *
 * @export
 * @param {any} {data, auth}
 * @returns
 */
export function reportStart({ data, shuffle, auth }) {
  const { isReplay, stationId, stationSeedType, id, artistId } = data;
  const { profileId, sessionId, playedFrom = 300 } = auth;

  if (usesReportingV3(stationSeedType, isReplay)) {
    return reportV3({ ...data, shuffle, status: REPORT_ACTION.START }, auth);
  }

  if (stationSeedType === STATION_TYPE.LIVE) {
    return transport(
      reportStreamStarted({
        ampUrl: getAmpUrl(store.getState()),
        artistId,
        host: getHost(store.getState()),
        id,
        playedFrom,
        profileId,
        sessionId,
        stationId,
      }),
    );
  }

  const payload = subscriptionPayloadMapper(data, auth);

  return transport(
    legacyStreamStartedOne({ ampUrl: getAmpUrl(store.getState()), payload }),
  );
}

/**
 * report15
 * Calls the right reporting API once a track position hits 15 seconds.
 *
 * @export
 * @param {any} {data, position, auth}
 * @returns
 */
export function report15({ data, position, shuffle, auth }) {
  const { reported, isReplay, stationSeedType, stationSeedId } = data;
  const { start } = reported;

  // HACK: The 2s time block prevents a case where player's time trigger before next song starts,
  // which makes it look like the new song started with 16s (or more)
  if (!start || start + 12 * 1000 > Date.now()) {
    return Promise.reject(
      new Error('Cannot report15s before 2s after reportStart'),
    );
  }

  if (usesReportingV3(stationSeedType, isReplay)) {
    return reportV3(
      {
        ...data,
        position,
        shuffle,
        status: REPORT_ACTION.REPORT_15,
      },
      auth,
    );
  }

  if (stationSeedType === 'live') {
    return Promise.reject(new Error('Cannot report15 on live stations'));
  }

  const payload = subscriptionPayloadMapper(data, auth);

  if (stationSeedType === 'track-show') {
    payload.seedShowId = stationSeedId;
    payload.showId = stationSeedId;
  }

  if (
    !(
      payload.seedArtistId ||
      payload.seedTrackId ||
      payload.seedFeaturedId ||
      payload.seedShowId ||
      payload.contentId
    )
  )
    return undefined;
  if (
    (payload.seedArtistId || payload.seedTrackId || payload.seedFeaturedId) &&
    !payload.artistId
  )
    return undefined;
  if (payload.seedShowId && !payload.showId) return undefined;

  return transport(
    legacyStreamStartedTwo({ ampUrl: getAmpUrl(store.getState()), payload }),
  );
}

/**
 * reportDone
 * Calls the right reporting API once a track ends normally.
 *
 * @export
 * @param {any} {data, position, auth}
 * @returns
 */
export function reportDone({ data, position, shuffle, auth }) {
  const { isReplay, stationSeedType } = data;

  if (usesReportingV3(stationSeedType, isReplay)) {
    return reportV3(
      {
        ...data,
        position,
        shuffle,
        status: REPORT_ACTION.DONE,
      },
      auth,
    );
  }

  if (stationSeedType === 'live') {
    return Promise.reject(new Error('Cannot reportDone on live stations'));
  }

  const payload = {
    ...subscriptionPayloadMapper(data, auth),
    elapsedTime: parseInt(position, 10),
    reason: 'completed',
  };

  return transport(
    legacyStreamDone({ ampUrl: getAmpUrl(store.getState()), payload }),
  );
}

/**
 * reportDone
 * Calls the right reporting API once user clicks on back arrow and rewinds track.
 *
 * @export
 * @param {any} {data, position, auth}
 * @returns
 */
export function reportRewind({ data, position, shuffle, auth }) {
  const { isReplay, stationSeedType } = data;

  if (usesReportingV3(stationSeedType, isReplay)) {
    return reportV3(
      {
        ...data,
        position,
        shuffle,
        status: REPORT_ACTION.REWIND,
      },
      auth,
    );
  }
  return Promise.reject();
}

/**
 * reportSkip
 * Calls the right reporting API once user skips current track.
 *
 * @export
 * @param {any} {data, position, auth}
 * @returns
 */
export function reportSkip({ data, position, shuffle, auth }) {
  const { isReplay, stationSeedType } = data;

  if (usesReportingV3(stationSeedType, isReplay)) {
    return reportV3(
      {
        ...data,
        position,
        shuffle,
        status: REPORT_ACTION.SKIP,
      },
      auth,
    );
  }

  if (stationSeedType === 'live') {
    return Promise.reject(new Error('Cannot reportDone on live stations'));
  }

  const payload = {
    ...subscriptionPayloadMapper(data, auth),
    elapsedTime: parseInt(position, 10),
    reason: 'skipped',
  };

  return transport(
    legacyStreamDone({ ampUrl: getAmpUrl(store.getState()), payload }),
  );
}

/**
 * reportStationChange
 * Calls the right reporting API once user changes station.
 *
 * @export
 * @param {any} {data, position, auth}
 * @returns
 */
export function reportStationChange({ data, position, shuffle, auth }) {
  const { isReplay, stationSeedType } = data;

  if (usesReportingV3(stationSeedType, isReplay)) {
    return reportV3(
      {
        ...data,
        position,
        shuffle,
        status: REPORT_ACTION.STATIONCHANGE,
      },
      auth,
    );
  }

  if (stationSeedType === 'live') {
    return Promise.reject(new Error('Cannot reportDone on live stations'));
  }

  const payload = {
    ...subscriptionPayloadMapper(data, auth),
    elapsedTime: parseInt(position, 10),
    reason: 'stationchange',
  };

  return transport(
    legacyStreamDone({ ampUrl: getAmpUrl(store.getState()), payload }),
  );
}

/**
 * reportReplay
 * Calls the right reporting API once a track ends due to a replay start.
 *
 * @export
 * @param {any} {data, position, auth}
 * @returns
 */
export function reportReplay({ data, position, shuffle, auth }) {
  const { isReplay, stationSeedType } = data;

  if (usesReportingV3(stationSeedType, isReplay)) {
    return reportV3(
      {
        ...data,
        position,
        shuffle,
        status: REPORT_ACTION.REPLAY,
      },
      auth,
    );
  }

  return Promise.reject();
}
