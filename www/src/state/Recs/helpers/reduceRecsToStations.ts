import type { Rec } from '../types';
import type { Station } from 'state/Stations/types';

const reduceRecsToStations = (recs: Array<any>): Array<Station> =>
  recs.reduce((stations: Array<Station>, rec) => {
    const content = rec?.content ?? ({} as Rec['content']);
    if (!content?.seedType) return stations;

    return [
      ...stations,
      {
        ...content,
        stationType: content.seedType.toUpperCase(),
      },
    ];
  }, []);

export default reduceRecsToStations;
