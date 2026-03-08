import { get } from 'lodash-es';
import { State } from './types';

export function setCurrentlyLoadedUrl(state: State, url: string): State {
  return {
    ...state,
    url,
  };
}

export function setIsWarmingUp(state: State, isWarmingUp: boolean): State {
  return {
    ...state,
    isWarmingUp,
  };
}

export function setPlayerInteracted(state: State, playerInteracted: boolean) {
  return {
    ...state,
    playerInteracted,
  };
}

export function setSkips(
  state: State,
  {
    hourlySkips,
    dailySkips,
  }: {
    dailySkips: number;
    hourlySkips: number;
  },
): State {
  if (
    get(state, ['skips', 'hourly']) !== hourlySkips ||
    get(state, ['skips', 'daily']) !== dailySkips
  ) {
    return {
      ...state,
      skips: {
        daily: dailySkips,
        hourly: hourlySkips,
      },
    };
  }
  return state;
}

export function setStationLoaded(state: State): State {
  return {
    ...state,
    loaded: true,
  };
}

export function setSpeed(state: State, speed: number): State {
  return {
    ...state,
    speed,
  };
}
