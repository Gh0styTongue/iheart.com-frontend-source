import { adsTargeting } from 'state/Ads/services';
import { CCR_CONTENT } from 'constants/ccrContent';
import { CONTEXTS } from 'modules/Logger';
import { encodePlaylistSeedId } from 'state/Playlist/helpers';
import { get } from 'lodash-es';
import { getAmpUrl } from 'state/Config/selectors';
import { getCredentials } from 'state/Session/selectors';
import {
  getCurrentIsCurated,
  getCurrentReportingKey,
} from 'state/Playlist/selectors';
import { getPlaylist } from 'state/Playlist/services';
import { getPlaylistInfo } from 'state/Routing/selectors';
import { getPlaylistRadioAdsEnabled } from 'state/Features/selectors';
import { getStationTargetingParams } from 'state/Ads/selectors';
import { getTrackById } from 'state/Tracks/selectors';
import { getTracksByIds } from 'state/Tracks/services';
import { PAGE_TYPE } from 'constants/pageType';
import {
  receivedPlaylists,
  setPlaylistRequestState,
} from 'state/Playlist/actions';
import { receivedTracks } from 'state/Tracks/actions';
import { receiveStationTargettingParams } from 'state/Ads/actions';
import { REQUEST_STATE } from 'state/Playlist/constants';
import { setHasHero } from 'state/Hero/actions';
import { State } from 'state/buildInitialState';
import { STATION_TYPE } from 'constants/stationTypes';
import { Thunk } from 'state/types';

import type { Track } from 'state/Tracks/types';

export function getAsyncData(): Thunk<Promise<void>> {
  return async function thunk(dispatch, getState, { logger, transport }) {
    const state = getState();

    const slugIdAndOwner = getPlaylistInfo(state);
    const ampUrl = getAmpUrl(state);

    const { id: playlistId = '', owner: playlistUserId = '' } = slugIdAndOwner;
    const { profileId, sessionId } = getCredentials(state);
    // Only to make sure we don't have a 404
    let playlistData;
    try {
      ({ data: playlistData } = await transport(
        getPlaylist({
          ampUrl,
          playlistId,
          playlistUserId: Number(playlistUserId),
          profileId,
          sessionId,
        }),
      ));
    } catch (err: any) {
      const errObj = new Error(
        (err?.message || err?.statusText) ?? 'error getting playlist',
      );
      logger.error(
        [CONTEXTS.ROUTER, CONTEXTS.PLAYLIST],
        errObj.message,
        {},
        errObj,
      );
      // if we're 401ed then the playlist may be available after auth, go
      // ahead with setting up redux and refetch on the client side
      if (get(err, ['response', 'status'], 0) === 401 && !__CLIENT__) {
        playlistData = {
          ownerId: playlistUserId,
          playlistId,
          requestState: REQUEST_STATE.NEEDS_AUTH,
        };
      } else {
        // otherwise the playlist doesn't exist or something went wrong,
        // pass it off to our normal error handling.
        throw err;
      }
    }

    const { tracks = [] } = playlistData || {};
    const missingTracks = tracks
      .slice(0, 20)
      .filter(
        ({ trackId }: any) => !get(getTrackById(state, { trackId }), 'id'),
      )
      .map(({ trackId }: any) => trackId);

    const { backfillTracks = [] } = playlistData || {};
    const missingBackfillTracks = backfillTracks
      .filter((trackId: any) => !get(getTrackById(state, trackId), 'id'))
      .map((trackId: any) => trackId);

    let adsParams = { data: {} };

    if (getPlaylistRadioAdsEnabled(state)) {
      try {
        adsParams = await transport(
          adsTargeting({
            ampUrl,
            reportingKey: get(playlistData, 'reportingKey', ''),
            type: 'COLLECTION',
          }),
        );
      } catch (err: any) {
        const errObj = new Error(
          (err?.message || err?.statusText) ?? 'error getting playlist radio',
        );
        logger.error(
          [CONTEXTS.SERVICES, CONTEXTS.PLAYLIST, CONTEXTS.ADS],
          errObj.message,
          {},
          errObj,
        );
        // allow this request to quietly fail so it doesn't get caught in a
        // higher-level catch
      }
    }

    let trackData: { tracks: Array<Track> } = { tracks: [] };
    let backfillTrackData: { tracks: Array<Track> } = { tracks: [] };

    if (missingTracks.length) {
      try {
        ({ data: trackData } = await transport(
          getTracksByIds({
            ampUrl,
            ids: missingTracks,
          }),
        ));
      } catch (err: any) {
        const errObj = new Error(
          (err?.message || err?.statusText) ?? 'error getting tracks',
        );
        logger.error(CONTEXTS.SERVICES, errObj.message, {}, errObj);
        throw errObj;
      }
    }

    if (missingBackfillTracks.length) {
      try {
        ({ data: backfillTrackData } = await transport(
          getTracksByIds({
            ampUrl,
            ids: missingBackfillTracks,
          }),
        ));
      } catch (err: any) {
        const errObj = new Error(
          (err?.message || err?.statusText) ?? 'error getting backfill tracks',
        );
        logger.error(CONTEXTS.SERVICES, errObj.message, {}, errObj);
        throw errObj;
      }
    }
    if (playlistData.requestState === REQUEST_STATE.NEEDS_AUTH) {
      dispatch(setHasHero(true));
      dispatch(setPlaylistRequestState(playlistData));
      return;
    }
    const { userId, id } = playlistData;

    // server-side, set requestState as NEEDS_AUTH so we can call for
    // playlist with logged in user info
    dispatch(receivedPlaylists([playlistData], null, null));
    dispatch(receivedTracks(trackData.tracks));
    dispatch(receivedTracks(backfillTrackData.tracks));
    dispatch(setHasHero(true));
    dispatch(
      receiveStationTargettingParams({
        id: encodePlaylistSeedId(userId, id),
        params: get(adsParams, 'data'),
        type: STATION_TYPE.COLLECTION,
      }),
    );
  };
}

export function pageInfo(state: State) {
  return {
    pageType:
      getCurrentIsCurated(state) ?
        PAGE_TYPE.CURATED_PLAYLIST
      : PAGE_TYPE.PLAYLIST,
    params: getStationTargetingParams(state),
    reportingKey: getCurrentReportingKey(state),
    targeting: {
      ccrcontent1: CCR_CONTENT.PLAYLIST,
      ...getStationTargetingParams(state),
    },
  };
}
