import * as reducers from './reducers';
import createReducer from 'state/createReducer';
import { ACTIONS } from './constants';
import { State } from './types';

export const initialState = {
  muted: false,
  volume: 50,
};

const reducer = createReducer<State>(initialState, {
  [ACTIONS.LOAD_TRACK]: reducers.loadTrack,
  [ACTIONS.SET_STATION]: reducers.setStation,
  [ACTIONS.SET_VOLUME]: reducers.setVolume,
  [ACTIONS.TOGGLE_MUTE]: reducers.toggleMute,
});

export default reducer;
