import { MyMusicSubType, State, StationType } from 'state/Playback/types';

type Payload = {
  id: string;
  subType?: MyMusicSubType;
  trackId?: number;
  type: StationType;
};

function setStation(
  state: State,
  { id, subType, trackId, type }: Payload,
): State {
  return {
    ...state,
    station: { id, subType, trackId, type },
  };
}

export default setStation;
