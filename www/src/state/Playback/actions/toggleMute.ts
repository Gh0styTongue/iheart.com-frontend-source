import { ACTIONS } from 'state/Playback/constants';
import { getMuted } from 'state/Playback/selectors';
import { Thunk } from 'state/types';

function toggleMute(forceState?: boolean): Thunk<Promise<void>> {
  return async function thunk(dispatch, getState) {
    const muted = forceState ?? !getMuted(getState());

    await dispatch({
      payload: muted,
      type: ACTIONS.TOGGLE_MUTE,
    });
  };
}

export default toggleMute;
