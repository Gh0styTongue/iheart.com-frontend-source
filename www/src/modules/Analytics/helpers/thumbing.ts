import Events from '../constants/events';
import { composeEventData, namespace, property } from '../factories';
import { station, Data as StationData } from './station';

export type ThumbingData = Readonly<{
  action: string;
  itemId: number;
  itemName: string;
  songId: number;
  songName: string;
}>;

export type Data = ThumbingData & StationData;

function thumbing(data: Data): ThumbingData {
  return composeEventData(Events.SaveDelete)(
    namespace('thumbing')(property('action', data.action, true)),
    namespace('item')(
      namespace('asset')(
        property('id', `artist|${data.itemId}`, true),
        property('name', data.itemName, true),
        namespace('sub')(
          property('id', `song|${data.songId}`, true),
          property('name', data.songName, true),
        ),
      ),
    ),
    station(data),
  ) as ThumbingData;
}

export default thumbing;
