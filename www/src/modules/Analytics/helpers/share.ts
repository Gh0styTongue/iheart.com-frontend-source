import Events from '../constants/events';
import { composeEventData, namespace, property } from '../factories';
import { station, Data as StationData } from './station';

export type ShareData = Readonly<{
  platform: string;
}>;

export type Data = ShareData & StationData;

function share(data: Data): ShareData {
  return composeEventData(Events.Share)(
    namespace('share')(property('platform', data.platform, true)),
    station(data),
  ) as ShareData;
}

export default share;
