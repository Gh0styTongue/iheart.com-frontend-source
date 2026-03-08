import { createSelector } from 'reselect';
import { get } from 'lodash-es';
import { State as RootState } from 'state/types';
import { State } from './types';

export const getPlayer = createSelector<RootState, RootState, State>(
  state => state,
  state => get(state, 'player', {}) as State,
);

export const getSkips = createSelector(getPlayer, player =>
  get(player, 'skips', {}),
);

export const getHourlySkips = createSelector(getSkips, skips =>
  get(skips, 'hourly', 0),
);

export const getDailySkips = createSelector(getSkips, skips =>
  get(skips, 'daily', 0),
);

export const getSkipsLeft = createSelector(
  getHourlySkips,
  getDailySkips,
  (hourlyLeft, dailyLeft) => Math.min(hourlyLeft, dailyLeft),
);

export const hasSkips = createSelector(
  getSkipsLeft,
  skipsLeft => skipsLeft > 0,
);

export const getStationLoaded = createSelector(getPlayer, player =>
  get(player, 'loaded'),
);

export const getPlayerInteracted = createSelector(getPlayer, player =>
  get(player, 'playerInteracted'),
);

export const getIsWarmingUp = createSelector(getPlayer, player =>
  get(player, 'isWarmingUp', false),
);

export const getCurrentlyLoadedUrl = createSelector(getPlayer, player =>
  get(player, 'url', ''),
);

export const getSpeed = createSelector(getPlayer, player =>
  get(player, 'speed', 1),
);
