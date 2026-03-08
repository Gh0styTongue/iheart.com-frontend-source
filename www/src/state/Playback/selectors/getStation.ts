import getPlayback from './getPlayback';
import { createSelector } from 'reselect';
import { get } from 'lodash-es';
import { State as Playback, Station } from 'state/Playback/types';
import { State } from 'state/buildInitialState';

const getStation = createSelector<State, Playback, Station | undefined>(
  getPlayback,
  playback => get(playback, 'station'),
);

export default getStation;
