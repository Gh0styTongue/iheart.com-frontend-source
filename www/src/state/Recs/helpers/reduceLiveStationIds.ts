import { SUB_TYPES } from '../constants';
import type { SubType } from '../types';
/**
 * From an Array of stations, returns a string list of liveStationIds, separated by commas
 */
const reduceLiveStationIds = (
  stations: Array<{ subType?: SubType; contentId: string }>,
) =>
  stations.reduce((acc: string, station) => {
    const id = station?.contentId as string;

    if (station?.subType !== SUB_TYPES.LIVE || !id) return acc;

    return acc ? `${acc},${id}` : `${id}`;
  }, '');

export default reduceLiveStationIds;
