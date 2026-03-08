/**
 * 🚧 Remove this entire folder once legacy playback has been
 * converted over to the new playback flow. Also, do not add
 * anything else into this reducer!!! 🚧
 */

import * as reducers from './reducers';
import createReducer from 'state/createReducer';
import {
  SET_CURRENTLY_LOADED_URL,
  SET_IS_WARMING_UP,
  SET_PLAYER_INTERACTED,
  SET_SKIPS,
  SET_SPEED,
  STATION_LOADED,
} from './constants';
import { State } from './types';

export const initialState = {
  isWarmingUp: false,
  speed: 1,
  playerUIError: null,
};

const reducer = createReducer<State>(initialState, {
  [SET_CURRENTLY_LOADED_URL]: reducers.setCurrentlyLoadedUrl,
  [SET_IS_WARMING_UP]: reducers.setIsWarmingUp,
  [SET_PLAYER_INTERACTED]: reducers.setPlayerInteracted,
  [SET_SKIPS]: reducers.setSkips,
  [SET_SPEED]: reducers.setSpeed,
  [STATION_LOADED]: reducers.setStationLoaded,
});

export default reducer;
