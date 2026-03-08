import {
  CUSTOM_TYPES,
  ON_DEMAND_TYPES,
  STATION_TYPE,
} from 'constants/stationTypes';

export default function (station, track) {
  const stationType = station.get('type');
  if (stationType === STATION_TYPE.LIVE) return station.get('name');
  if (CUSTOM_TYPES.includes(stationType)) {
    return `${track.get('title')} - ${track.get('artist')} (${station.get(
      'name',
    )} Radio)`;
  }
  if (ON_DEMAND_TYPES.includes(stationType)) {
    return `${track.get('title')} - ${track.get('artist')} (${station.get(
      'name',
    )})`;
  }
  if (track) return `${track.get('title')} (${track.get('showName')})`;

  return "You're listening to iHeart";
}
