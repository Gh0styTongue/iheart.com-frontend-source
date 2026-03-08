import toggleMute from './toggleMute';
import { ACTIONS } from 'state/Playback/constants';
import { Thunk } from 'state/types';

function setVolume(volume: number): Thunk<Promise<void>> {
  return async function thunk(dispatch) {
    const rounded = Math.round(volume);

    if (rounded <= 0) {
      await dispatch(toggleMute());
      return;
    }

    await dispatch({
      payload: rounded,
      type: ACTIONS.SET_VOLUME,
    });
  };
}

export default setVolume;
