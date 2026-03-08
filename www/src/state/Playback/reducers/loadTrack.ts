import { State } from 'state/Playback/types';

function loadTrack(
  state: State,
  { id: trackId, uniqueTrackId }: { id: number; uniqueTrackId: string },
): State {
  return {
    ...state,
    station: {
      ...state.station,
      trackId,
      uniqueTrackId,
    },
  };
}

export default loadTrack;
