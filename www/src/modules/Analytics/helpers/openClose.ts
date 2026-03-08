import Events from '../constants/events';
import { composeEventData, namespace, property } from '../factories';
import { station, Station, Data as StationData } from './station';

export type Data = StationData & {
  action: 'open' | 'close';
  trackArtistId?: string | number;
  trackArtistName?: string;
};

export type OpenClose = Station & {
  player: {
    action: string;
  };
};

function openClose(data: Data): OpenClose {
  return composeEventData(Events.OpenClosePlayer)(
    namespace('player')(property('action', data.action, true)),
    station(data),
  ) as OpenClose;
}

export default openClose;
