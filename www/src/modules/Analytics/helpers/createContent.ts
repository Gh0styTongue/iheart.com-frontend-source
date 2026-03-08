import Events from '../constants/events';
import { composeEventData } from '../factories';
import { Data, Station, station } from './station';

export type CreateContent = Station & {
  shuffle: {
    action: string;
  };
};

function createContent(data: Data): CreateContent {
  return composeEventData(Events.CreateContent)(station(data)) as CreateContent;
}

export default createContent;
