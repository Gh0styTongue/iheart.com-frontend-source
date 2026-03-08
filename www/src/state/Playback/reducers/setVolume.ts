import { State } from 'state/Playback/types';

function setVolume(state: State, volume: number): State {
  return {
    ...state,
    volume,
  };
}

export default setVolume;
