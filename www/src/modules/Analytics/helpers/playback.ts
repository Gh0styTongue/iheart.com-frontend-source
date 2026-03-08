import Events from '../constants/events';
import { composeEventData } from '../factories';
import { item, Item, Data as ItemData } from './item';
import { station, Station, Data as StationData } from './station';

export type Data = ItemData & StationData;

function playback(
  event: (typeof Events)[keyof typeof Events],
  data: Data,
): Item & Station {
  return composeEventData(event)(station(data), item(data)) as Item & Station;
}

export default playback;
