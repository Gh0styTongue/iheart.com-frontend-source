import createSlice from 'state/createSlice';
import {
  DEFAULT_PLAYER_TARGETING_VALUES,
  DEFAULT_USER_TARGETING_VALUES,
} from 'ads/targeting/constants';
import type {
  GlobalTargetingValues,
  PlayerTargetingValues,
} from 'ads/targeting/types';

export type State = {
  /**
   * Targeting values attached to the player's state. Traditionally accessed via playerState.getTracking()
   */
  playerTargeting: PlayerTargetingValues;
  /**
   * Global user targeting values
   */
  globalTargeting: GlobalTargetingValues;
};

export const initialState: State = {
  globalTargeting: DEFAULT_USER_TARGETING_VALUES,
  playerTargeting: DEFAULT_PLAYER_TARGETING_VALUES,
};

const Targeting = createSlice({
  path: 'targeting',
  initialState,
  reducers: {
    setPlayerTargeting: (
      state: State,
      playerTargeting: State['playerTargeting'],
    ) => ({
      playerTargeting,
    }),
    setGlobalTargeting: (
      state: State,
      globalTargeting: State['globalTargeting'],
    ) => ({
      globalTargeting,
    }),
  },
});

export default Targeting;
