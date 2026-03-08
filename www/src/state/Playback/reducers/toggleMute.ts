import { State } from 'state/Playback/types';

function toggleMute(state: State, muted: boolean): State {
  return {
    ...state,
    muted,
  };
}

export default toggleMute;
