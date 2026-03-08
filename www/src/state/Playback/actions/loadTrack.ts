import { Action } from 'state/types';
import { ACTIONS } from 'state/Playback/constants';

function loadTrack(
  id: number,
  uniqueTrackId?: string,
): Action<{ id: number; uniqueTrackId?: string }> {
  return {
    payload: { id, uniqueTrackId },
    type: ACTIONS.LOAD_TRACK,
  };
}

export default loadTrack;
