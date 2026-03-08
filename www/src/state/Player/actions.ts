import analytics, { Events } from 'modules/Analytics';
import { Action } from 'state/types';
import {
  SET_CURRENTLY_LOADED_URL,
  SET_IS_WARMING_UP,
  SET_PLAYER_INTERACTED,
  SET_SKIPS,
  SET_SPEED,
  STATION_LOADED,
} from './constants';

export function setCurrentlyLoadedUrl(url: string): Action<string> {
  return {
    payload: url,
    type: SET_CURRENTLY_LOADED_URL,
  };
}

export function setPlayerInteracted(interacted: boolean) {
  return {
    payload: interacted,
    type: SET_PLAYER_INTERACTED,
  };
}

export function setIsWarmingUp(isWarmingUp: boolean): Action<boolean> {
  return {
    payload: isWarmingUp,
    type: SET_IS_WARMING_UP,
  };
}

export function setSkips(
  hourlySkips: number,
  dailySkips: number,
): Action<{
  dailySkips: number;
  hourlySkips: number;
}> {
  return {
    payload: { dailySkips, hourlySkips },
    type: SET_SKIPS,
  };
}

export function setStationLoaded(): Action<undefined> {
  return { type: STATION_LOADED };
}

export function setSpeed(
  id: number | string,
  name: string,
  oldSpeed: number,
  speed: number,
  trackId: number,
  trackName: string,
): Action<number> {
  return {
    meta: {
      analytics: () => {
        analytics.track(Events.SpeedChange, {
          item: {
            asset: {
              id: `podcast|${id}`,
              name,
              sub: {
                id: `episode|${String(trackId)}`,
                name: trackName,
              },
            },
          },
          speedChange: {
            newPlaybackSpeed: speed,
            oldPlaybackSpeed: oldSpeed,
          },
          station: {
            asset: {
              id: `podcast|${String(id)}`,
              name,
              sub: {
                id: `episode|${String(trackId)}`,
                name: trackName,
              },
            },
          },
        });
      },
    },
    payload: speed,
    type: SET_SPEED,
  };
}
