import { Action } from 'state/types';
import { ACTIONS } from 'state/Playback/constants';
import { MyMusicSubType, StationType } from 'state/Playback/types';

type Payload = {
  id: number | string;
  playedFrom: string;
  subType?: MyMusicSubType;
  track?: {
    id: number;
  };
  type: StationType;
};

function setStation(payload: Payload): Action<Payload> {
  return {
    payload,
    type: ACTIONS.SET_STATION,
  };
}

export default setStation;
