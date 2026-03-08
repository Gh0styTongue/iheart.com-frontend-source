import { get } from 'lodash-es';

function nameSorter(
  stationA: Record<string, any>,
  stationB: Record<string, any>,
  sortBy = 'name',
) {
  if (
    get(stationA, sortBy, '').toLowerCase() >
    get(stationB, sortBy, '').toLowerCase()
  )
    return 1;
  return -1;
}

export default nameSorter;
