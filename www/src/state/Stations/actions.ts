import { AxiosResponse } from 'axios';
// Types
import analytics, { Events } from 'modules/Analytics';
import trackers from 'trackers';
import { artistReceived, toggleFavoriteArtist } from 'state/Artists/actions';
import { COLLECTION_TYPES, STATION_TYPE } from 'constants/stationTypes';
import { CONTEXTS, STATION_TYPE_CONTEXT_MAP } from 'modules/Logger';
import {
  createStation as createStationRequest,
  deleteByTypeAndId,
  getUserStations,
} from './services';
import { E } from 'shared/utils/Hub';
import { fetchThumbs, requestTracks } from 'state/Tracks/actions';
import { get, omit } from 'lodash-es';
import { getAmpUrl } from 'state/Config/selectors';
import { getCredentials, getIsAnonymous } from 'state/Session/selectors';
import { getCurrentFavoritedTracks } from 'state/Favorites/selectors';
import { getTrackById } from 'state/Tracks/selectors';
import { GrowlVariants } from 'components/Growls/constants';
import { mapCustomStation, mapLiveStation } from 'web-player/mapper';
import { openSignupModal, openThumbsTip, showGrowl } from 'state/UI/actions';
import { postNewThumb } from './helpers';
import {
  RECEIVE_LISTEN_HISTORY,
  RECEIVE_STATIONS,
  REJECT_LISTEN_HISTORY,
  REMOVE_STATION,
  REQUEST_LISTEN_HISTORY,
  SAVE_STATION,
  SET_LAST_PLAYED_DATE,
  UPDATE_THUMBS,
} from './constants';
import { setHasMFR } from 'state/Favorites/actions';
import { showPlaylistSelector } from 'state/Entitlements/selectors';
import { Thunk } from 'state/types';
import { toggleFavoriteStation } from 'state/Live/actions';
import { toggleFollowed } from 'state/Podcast/actions';
import type {
  ListenHistoryResponse,
  MetaHub,
  Sentiment,
  Station,
} from './types';
import type { StationTypeValue } from 'constants/stationTypes';

const INCLUDE_PLAYLIST_CAMPAIGN_ID = 'playlist_collections';
const SORT_BY_LAST_PLAYED = 'LAST_PLAYED';
const customTypes = ['CUSTOM', 'ARTIST', 'TRACK', 'FEATURED', 'FAVORITES'];

export function rejectListenHistory(error: Error) {
  return {
    error,
    type: REJECT_LISTEN_HISTORY,
  };
}

export function requestListenHistory() {
  return { type: REQUEST_LISTEN_HISTORY };
}

export function receiveStations(stations: Array<Station>) {
  return {
    payload: stations,
    type: RECEIVE_STATIONS,
  };
}

export function receiveListenHistory(
  stations: Array<Station>,
  userId: number | null,
  totalListenHistoryStations: number,
) {
  return {
    payload: { stations, totalListenHistoryStations, userId },
    type: RECEIVE_LISTEN_HISTORY,
  };
}

export function fetchListenHistory(
  userId?: number,
  limit?: number,
  offset?: number,
  sortBy: string = SORT_BY_LAST_PLAYED,
): Thunk<Promise<void>> {
  return async function thunk(
    dispatch,
    getState,
    { logger, transport },
  ): Promise<void> {
    dispatch(requestListenHistory());
    const state = getState();
    const { profileId, sessionId } = getCredentials(state);
    const ampUrl = getAmpUrl(state);
    const includePlaylists = showPlaylistSelector(state);
    const requestId = userId || profileId;

    try {
      const response: AxiosResponse<ListenHistoryResponse> = await transport(
        getUserStations(ampUrl, profileId, sessionId, requestId, {
          campaignId:
            includePlaylists ? INCLUDE_PLAYLIST_CAMPAIGN_ID : undefined,
          limit,
          offset,
          sortBy,
        }),
      );

      const stations = response.data.hits.map(station => {
        const withContent =
          station.content ?
            { ...station.content[0], ...omit(station, ['content']) }
          : station;
        if (withContent.stationType === 'LIVE') {
          return mapLiveStation(withContent);
        }
        if (customTypes.includes(withContent.stationType)) {
          return mapCustomStation(withContent);
        }
        return withContent;
      }) as Array<Station>;

      dispatch(receiveStations(stations));
      dispatch(
        receiveListenHistory(stations, requestId, get(response, 'total', 0)),
      );
      dispatch(fetchThumbs());
    } catch (e: any) {
      const errObj =
        e instanceof Error ? e : new Error(e.statusText ?? 'error');
      logger.error(
        [CONTEXTS.REDUX, CONTEXTS.PLAYBACK],
        errObj.message,
        {},
        errObj,
      );
      dispatch(rejectListenHistory(e));
      throw errObj;
    }
  };
}

export function setLastPlayedDate(
  seedType: string,
  seedId: number | string,
  timestamp: number,
) {
  return {
    payload: {
      seedId,
      seedType,
      timestamp,
    },
    type: SET_LAST_PLAYED_DATE,
  };
}

export function saveStation(
  seedType: string,
  seedId: number | string,
  newStationData: Record<string, unknown>,
) {
  return {
    payload: { data: newStationData, seedId, seedType },
    type: SAVE_STATION,
  };
}

export function createStation(
  seedType: StationTypeValue,
  seedId: number | string,
  playedFrom?: string,
): Thunk<Promise<{ id: number }>> {
  return async function thunk(dispatch, getState, { logger, transport }) {
    const state = getState();
    const { profileId, sessionId } = getCredentials(state);
    const ampUrl = getAmpUrl(state);

    if (
      ![
        ...COLLECTION_TYPES,
        STATION_TYPE.MY_MUSIC,
        STATION_TYPE.ALBUM,
      ].includes(seedType)
    ) {
      const isMFR =
        seedType === STATION_TYPE.FAVORITES &&
        Number(seedId) === Number(profileId);
      let doesMeetMFRreq = true;
      let data;
      try {
        ({ data } = await transport(
          createStationRequest({
            ampUrl,
            playedFrom,
            profileId,
            seedId,
            seedType,
            sessionId,
          }),
        ));

        if (
          seedType === STATION_TYPE.ARTIST &&
          playedFrom !== 'DEFAULT' &&
          !data.lastPlayedDate
        ) {
          analytics.trackCreateContent!({
            id: data.seedArtistId,
            name: data.artistName,
            type: 'artist',
          });
        }

        dispatch(
          saveStation(seedType, seedId, {
            ...data,
            lastPlayedDate: data.lastPlayedDate || Date.now(),
          }),
        );

        return data;
      } catch (e: any) {
        const errObj =
          e instanceof Error ? e : new Error(e.statusText ?? 'error');
        logger.error(
          [
            CONTEXTS.REDUX,
            CONTEXTS.PLAYBACK,
            STATION_TYPE_CONTEXT_MAP[seedType],
          ],
          errObj.message,
          {},
          errObj,
        );
        if (isMFR && e.response?.data?.error?.code === 752) {
          doesMeetMFRreq = false;
        } else {
          throw errObj;
        }
      } finally {
        if (isMFR) {
          dispatch(setHasMFR(doesMeetMFRreq));
        }
      }
    }

    return dispatch(setLastPlayedDate(seedType, seedId, Date.now()));
  };
}

export function updateThumbs({
  profileId,
  seedId,
  sentiment,
  stationId,
  stationType,
  trackId,
}: {
  profileId: number | null;
  seedId: number | string;
  sentiment: Sentiment;
  stationId: string;
  stationType: StationTypeValue;
  trackId: number;
}) {
  const meta: {
    deferHub: boolean;
    hub: MetaHub;
  } = {
    deferHub: true,
    hub: [
      {
        args: [stationId, Number(trackId), sentiment],
        event: E.THUMB_CHANGED,
      },
    ],
  };

  return {
    meta,
    payload: {
      profileId,
      seedId,
      sentiment,
      stationId,
      stationType,
      trackId,
    },
    type: UPDATE_THUMBS,
  };
}

export function updateThumbsData({
  existingSentiment,
  seedId,
  sentiment,
  stationId,
  stationType,
  trackId,
  trackingData,
}: {
  existingSentiment: Sentiment;
  seedId: number | string;
  sentiment: Sentiment;
  stationId: string;
  stationType: StationTypeValue;
  trackId: number;
  trackingData: any;
}): Thunk<Promise<void>> {
  return async function thunk(dispatch, getState, { logger, transport }) {
    const state = getState();
    const { profileId, sessionId } = getCredentials(state);
    const ampUrl = getAmpUrl(state);
    const totalThumbsUp = getCurrentFavoritedTracks(state).length;

    let action = sentiment === 1 ? Events.ThumbsUp : Events.ThumbsDown;
    if (sentiment === 0)
      action = existingSentiment === 1 ? Events.UnthumbUp : Events.UnthumbDown;
    trackers.track(action, {
      artistName: trackingData.artistName,
      artistId: trackingData.artistId,
      trackName: trackingData.songId,
      stationType: trackingData.type,
    });
    analytics.trackThumbing!({ action, ...trackingData });
    if (totalThumbsUp === 1 && sentiment === 1) {
      dispatch(openThumbsTip({ trackId }));
    }

    if (getIsAnonymous(state)) {
      dispatch(openSignupModal({ context: `${stationType}_thumb` }));
      return;
    }

    const track = getTrackById(state, { trackId });
    if (!Object.keys(track).length) await dispatch(requestTracks([trackId]));

    let newStationId = stationId;

    if (!newStationId) {
      let data;
      try {
        ({ data } = await transport(
          createStationRequest({
            ampUrl,
            profileId,
            seedId,
            seedType: stationType,
            sessionId,
          }),
        ));
      } catch (e: any) {
        const errObj =
          e instanceof Error ? e : new Error(e.statusText ?? 'error');
        logger.error(
          [
            CONTEXTS.REDUX,
            CONTEXTS.PLAYBACK,
            STATION_TYPE_CONTEXT_MAP[stationType],
          ],
          errObj.message,
          {},
          errObj,
        );
        throw errObj;
      }
      dispatch(
        artistReceived([{ ...data, artistId: seedId, stationId: data.id }]),
      );
      newStationId = data.id;
    }

    dispatch(
      updateThumbs({
        profileId,
        seedId,
        sentiment,
        stationId: newStationId,
        stationType,
        trackId,
      }),
    );

    // If user is thumbing up/down, not unthumbing, show a growl
    if (sentiment !== 0) {
      dispatch(
        showGrowl({
          type: GrowlVariants.ThumbsUpdated,
          data: {
            sentiment,
            type: stationType,
            stationId,
          },
        }),
      );
    }

    await postNewThumb({
      ampUrl,
      logger,
      profileId,
      sentiment,
      sessionId,
      stationId: newStationId,
      stationType,
      trackId,
      transport,
    });
  };
}

export function toggleStationSaved(
  type: string,
  id: number | string,
  recentOnly = false,
) {
  if (type === STATION_TYPE.PODCAST) {
    return toggleFollowed(id);
  }

  if (type === STATION_TYPE.LIVE) {
    return toggleFavoriteStation({
      recentOnly,
      stationId: typeof id === 'number' ? id.toString() : id,
    });
  }

  if (type === STATION_TYPE.ARTIST || type === STATION_TYPE.TRACK) {
    return toggleFavoriteArtist({ artistId: id, recentOnly });
  }

  throw new Error(`Cannot favorite ${type} stations`);
}

export function removeStation({
  seedId,
  stationType,
  stationId,
}: {
  seedId: number | string;
  stationId?: number;
  stationType: StationTypeValue;
}) {
  return {
    payload: { seedId, stationId, stationType },
    type: REMOVE_STATION,
  };
}

export function deleteFromListenHistory({
  stationType,
  stationId,
  seedId,
}: {
  seedId: number | string;
  stationId?: number;
  stationType: StationTypeValue;
}): Thunk<Promise<void>> {
  return async (dispatch, getState, { transport }) => {
    const state = getState();
    const { profileId, sessionId } = getCredentials(state);
    const ampUrl = getAmpUrl(state);

    await transport(
      deleteByTypeAndId({
        ampUrl,
        profileId,
        sessionId,
        stationId: stationId || seedId,
        stationType,
      }),
    );

    dispatch(removeStation({ seedId, stationId, stationType }));
  };
}
