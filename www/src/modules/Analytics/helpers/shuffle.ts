import Events from '../constants/events';
import { composeEventData, namespace, property } from '../factories';
import { station, Station, Data as StationData } from './station';

export type Data = StationData & {
  action: 'shuffle' | 'unshuffle';
};

export type Shuffle = Station & {
  shuffle: {
    action: string;
  };
};

function shuffle(data: Data): Shuffle {
  return composeEventData(Events.Shuffle)(
    namespace('shuffle')(property('action', data.action, true)),
    station(data),
  ) as Shuffle;
}

export default shuffle;
