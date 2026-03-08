import { Coords, Location, Market } from './types';
import { createSelector } from 'reselect';
import { get } from 'lodash-es';
import { State as RootState } from 'state/types';

export const getLocation = (state: RootState): Location =>
  get(state, 'location', {}) as Location;

export const getCurrentLocation = createSelector(
  getLocation,
  location => location.currentLocation,
);

export const getDefaultMarketId = createSelector(
  getLocation,
  location => location.defaultMarketId!,
);

export const getDefaultMarket = createSelector(
  getLocation,
  location => location.defaultMarket,
);

export const getCurrentMarket = createSelector<RootState, Location, Market>(
  getLocation,
  location =>
    get(location, 'currentMarket', getDefaultMarket.resultFunc(location)),
);

export const getCurrentCoordinates = createSelector(
  getCurrentLocation,
  location => get(location, 'coords', {}) as Coords,
);

export const getCurrentZip = createSelector(
  getCurrentLocation,
  location => location && location.zip,
);

export const getCurrentCountry = createSelector(
  getCurrentLocation,
  location => location && location.country,
);
