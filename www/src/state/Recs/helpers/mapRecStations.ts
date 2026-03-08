import { SUB_TYPES } from '../constants';
import type { LiveStation } from 'state/Live/types';
import type { Rec } from '../types';

/**
 * @returns {Array<Rec | Rec & { content: LiveStation }>}
 * @param {Array<Rec>} stations
 * @param {Array<LiveStation>} liveStations
 */
const mapRecStations = (
  stations: Array<Rec>,
  liveStations: Array<LiveStation>,
) =>
  stations.map(station => {
    if (station.subType !== SUB_TYPES.LIVE) return station;

    return {
      ...station,
      content: {
        ...station.content,
        ...liveStations.find(({ id }) => station?.contentId === id),
      },
    };
  });

export default mapRecStations;
