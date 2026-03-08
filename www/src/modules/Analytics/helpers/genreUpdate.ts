import Events from '../constants/events';
import { composeEventData, namespace, property } from '../factories';

export type Data = Readonly<{
  deselected: string | null | undefined;
  selected: string | null | undefined;
  type: string;
}>;

export type GenreUpdate = Readonly<{
  genreUpdate: {
    deselected: string | null | undefined;
    selected: string | null | undefined;
    type: string;
  };
}>;

function genreUpdate(data: Data): GenreUpdate {
  return composeEventData(Events.GenreUpdate)(
    namespace('genreUpdate')(
      property('type', data.type, true),
      property('selected', data.selected),
      property('deselected', data.deselected),
    ),
  ) as GenreUpdate;
}

export default genreUpdate;
