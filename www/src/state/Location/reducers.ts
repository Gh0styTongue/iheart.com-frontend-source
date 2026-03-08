import { Location, Market } from './types';
import { merge } from 'lodash-es';

export function receiveCurrentLocation(
  state: Location,
  {
    latitude,
    longitude,
    country,
    zip,
  }: {
    country: string;
    latitude: number;
    longitude: number;
    zip: string;
  },
) {
  return merge({}, state, {
    currentLocation: {
      coords: {
        latitude,
        longitude,
      },
      country,
      zip,
    },
  });
}

export function receiveCurrentMarket(state: Location, payload: Market) {
  return merge({}, state, { currentMarket: payload });
}

export function receiveDefaultMarket(state: Location, payload: Market) {
  return merge({}, state, { defaultMarket: payload });
}
