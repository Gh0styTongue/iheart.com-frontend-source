import composeRequest, {
  authHeaders,
  body,
  header,
  method,
  urlTagged,
} from 'api/helpers';
import { CONTEXTS } from 'modules/Logger';
import { getAmpUrl } from 'state/Config/selectors';
import { getCredentials } from 'state/Session/selectors';
import { getTracks } from 'state/Tracks/selectors';
import { requestTracks } from 'state/Tracks/actions';
import { State } from './types';
import { Thunk } from 'state/types';

const constant = 'YOUR_LIBRARY:SAVE_SONGS';

export function service(ids: Array<number | string>): Thunk<Promise<void>> {
  return async function thunk(_dispatch, getState, { transport }) {
    const state = getState();
    const ampUrl = getAmpUrl(state);
    const { profileId, sessionId } = getCredentials(state);

    await transport(
      composeRequest(
        authHeaders(profileId, sessionId),
        body({ tracks: ids }),
        header('Accept', 'application/json'),
        header('Content-Type', 'application/json'),
        method('put'),
        urlTagged`${{ ampUrl }}/api/v3/collection/user/${{
          profileId: String(profileId),
        }}/mymusic`,
      )(),
    );
  };
}

type SaveSongsReturnType = Promise<void>;
function action(ids: Array<number | string>): Thunk<SaveSongsReturnType> {
  return async function thunk(dispatch, getState, { logger }) {
    try {
      const state = getState();
      const songs = getTracks(state);
      const missingTracks = ids.filter(
        (id: number | string): boolean => songs[id] === undefined,
      );

      if (missingTracks.length) {
        await dispatch(requestTracks(missingTracks));
      }

      await dispatch(service(ids));
      dispatch({ payload: ids, type: constant });
    } catch (error: any) {
      const errObj = error instanceof Error ? error : new Error(error);
      logger.error([CONTEXTS.REDUX, constant], errObj.message, {}, errObj);
      throw errObj;
    }
  };
}

export type SaveSongs = (ids: Array<number | string>) => SaveSongsReturnType;

function reducer(state: State, payload: Array<number>): State {
  const ids = { ...state.songs.ids };

  payload.forEach((id: number): void => {
    ids[id] = false;
  });

  return {
    ...state,
    songs: {
      ...state.songs,
      ids,
    },
  };
}

export default {
  action,
  constant,
  reducer,
};
