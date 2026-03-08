import { createSelector } from 'reselect';
import { State as Playback } from 'state/Playback/types';
import { State } from 'state/buildInitialState';

const getPlayback = createSelector<State, State, Playback>(
  state => state,
  state => state.playback,
);

export default getPlayback;
