import { AxiosResponse } from 'axios';
import { getAmpUrl } from 'state/Config/selectors';
import { getCredentials } from 'state/Session/selectors';
import { getTracksByIds, getUserThumbs } from './services';
import { RECEIVE_THUMBS, RECEIVE_TRACKS } from './constants';
import { Thumb, ThumbsResponse, Track } from './types';
import { Thunk } from 'state/types';

export function receivedTracks(tracks: Array<Track>) {
  return {
    payload: { tracks },
    type: RECEIVE_TRACKS,
  };
}

export function receivedThumbs(thumbs: Array<Thumb>) {
  return {
    payload: thumbs,
    type: RECEIVE_THUMBS,
  };
}

export function requestTracks(
  ids: Array<number | string>,
): Thunk<Promise<Array<Track>>> {
  return async (dispatch, getState, { transport }) => {
    const state = getState();
    const ampUrl = getAmpUrl(state);
    const { data } = await transport(getTracksByIds({ ampUrl, ids }));
    const { tracks } = data;

    dispatch(receivedTracks(tracks));
    return tracks;
  };
}

export function requestBackfillTracks(
  ids: Array<number>,
): Thunk<Promise<Array<Track>>> {
  return async (dispatch, getState, { transport }) => {
    const state = getState();
    const ampUrl = getAmpUrl(state);
    const { data } = await transport(getTracksByIds({ ampUrl, ids }));
    const { tracks } = data;

    dispatch(receivedTracks(tracks));
    return tracks;
  };
}

export function fetchThumbs(): Thunk<void> {
  return async (dispatch, getState, { transport }) => {
    const state = getState();
    const { profileId, sessionId } = getCredentials(state);
    const ampUrl = getAmpUrl(state);
    if (profileId) {
      const response: AxiosResponse<ThumbsResponse> = await transport(
        getUserThumbs({ ampUrl, profileId, sessionId }),
      );
      dispatch(receivedThumbs(response?.data?.hits ?? []));
    }
  };
}
