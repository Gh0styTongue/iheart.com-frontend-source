import composeRequest, {
  authHeaders,
  header,
  method,
  urlTagged,
} from 'api/helpers';
import { CONTEXTS } from 'modules/Logger';
import { getAmpUrl } from 'state/Config/selectors';
import { getCredentials } from 'state/Session/selectors';
import { State } from './types';
import { Thunk } from 'state/types';

const constant = 'YOUR_LIBRARY:REMOVE_SONGS';

export function service(ids: Array<number>): Thunk<Promise<void>> {
  return async function thunk(_dispatch, getState, { transport }) {
    const state = getState();
    const ampUrl = getAmpUrl(state);
    const { profileId, sessionId } = getCredentials(state);

    const trackIds = ids.join(',');

    await transport(
      composeRequest(
        authHeaders(profileId, sessionId),
        header('Accept', 'application/json'),
        method('delete'),
        urlTagged`${{ ampUrl }}/api/v3/collection/user/${{
          profileId: String(profileId),
        }}/mymusic/${{
          trackIds,
        }}`,
      )(),
    );
  };
}

function action(ids: Array<number>): Thunk<Promise<void>> {
  return async function thunk(dispatch, _getState, { logger }) {
    try {
      await dispatch(service(ids));
      dispatch({ payload: ids, type: constant });
    } catch (error: any) {
      const errObj = error instanceof Error ? error : new Error(error);
      logger.error([CONTEXTS.REDUX, constant], errObj.message, {}, errObj);
      throw errObj;
    }
  };
}

function reducer(state: State, payload: Array<number>): State {
  const ids = { ...state.songs.ids };

  payload.forEach((id: number): void => {
    ids[id] = true;
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
