import composeRequest, {
  authHeaders,
  header,
  method,
  query,
  urlTagged,
} from 'api/helpers';
import { CONTEXTS } from 'modules/Logger';
import { createSelector } from 'reselect';
import { getAmpUrl } from 'state/Config/selectors';
import { getCredentials } from 'state/Session/selectors';
import { State as GlobalState, Selector, Thunk } from 'state/types';
import { identity } from 'lodash-es';
import { receivedTracks } from 'state/Tracks/actions';
import { Track as Song } from 'state/Tracks/types';
import { State } from './types';

const constant = 'YOUR_LIBRARY:GET_SONGS';

function service(
  limit: number,
): Thunk<Promise<{ nextPageKey: string | null; songs: any }>> {
  return async function thunk(_dispatch, getState, { transport }) {
    const state = getState();
    const ampUrl = getAmpUrl(state);
    const { profileId, sessionId } = getCredentials(state);
    const { nextPageKey } = state.yourLibrary.songs;

    const response = await transport(
      composeRequest(
        authHeaders(profileId, sessionId),
        header('Accept', 'application/json'),
        method('get'),
        nextPageKey ? query({ pageKey: nextPageKey }) : identity,
        query({ limit }),
        urlTagged`${{ ampUrl }}/api/v3/collection/user/${{
          profileId: String(profileId),
        }}/mymusic`,
      )(),
    );

    const { data, links } = response.data;

    return {
      nextPageKey: links ? links.nextPageKey : null,
      songs: data,
    };
  };
}

function action(limit: number): Thunk<Promise<void>> {
  return async function thunk(dispatch, _getState, { logger }) {
    try {
      const data = await dispatch(service(limit));
      dispatch(receivedTracks(data.songs));
      dispatch({ payload: data, type: constant });
    } catch (error: any) {
      const errObj = error instanceof Error ? error : new Error(error);
      logger.error([CONTEXTS.REDUX, constant], errObj.message, {}, errObj);
      throw errObj;
    }
  };
}

function reducer(
  state: State,
  payload: {
    nextPageKey: string | null;
    songs: Array<Song>;
  },
): State {
  const filtered = payload.songs.filter(
    (song: Song): boolean =>
      state.songs.ids[String(song.trackId)] === undefined,
  );

  const ids = { ...state.songs.ids };

  filtered.forEach((song: Song): void => {
    ids[song.trackId] = false;
  });

  return {
    ...state,
    songs: {
      ids,
      nextPageKey: payload.nextPageKey,
    },
  };
}

const selectHasNextPageKey = (state: GlobalState): boolean =>
  !!state.yourLibrary.songs.nextPageKey;

const selectSongs: Selector<Array<Song>> = createSelector(
  (
    state: GlobalState,
  ): {
    [id: string]: Song;
  } => state.tracks.tracks!,
  (
    state: GlobalState,
  ): {
    [id: string]: boolean;
  } => state.yourLibrary.songs.ids,
  (
    songs: {
      [id: string]: Song;
    },
    ids: {
      [id: string]: boolean;
    },
  ): Array<Song> =>
    Object.keys(ids)
      .filter((id: string): boolean => !ids[id])
      .map((id: string): Song => songs[id])
      .sort((a: Song, b: Song): -1 | 0 | 1 => {
        const titleA = String(a.trackTitle).toLowerCase();
        const titleB = String(b.trackTitle).toLowerCase();
        if (titleA < titleB) return -1;
        if (titleA > titleB) return 1;
        return 0;
      }),
);

export default {
  action,
  constant,
  reducer,
  selectors: {
    selectHasNextPageKey,
    selectSongs,
  },
};
