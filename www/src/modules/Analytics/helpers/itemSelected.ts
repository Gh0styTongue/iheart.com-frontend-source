import Events from '../constants/events';
import { composeEventData, namespace, property } from '../factories';
import { station, Station, Data as StationData } from './station';

export type ItemAsset = {
  id: number;
  name: string;
};

export type Data = StationData &
  ItemAsset & {
    location: string;
  };

export type ItemSelected = Station & {
  event: {
    location: string;
  };
};

function itemSelected(data: Data): ItemSelected {
  return composeEventData(Events.ItemSelected)(
    station(data),
    namespace('event')(property('location', data.location, true)),
    namespace('item')(
      namespace('asset')(
        property('id', `${data.id}`, true),
        property('name', data.name, false),
      ),
    ),
  ) as ItemSelected;
}

export default itemSelected;
