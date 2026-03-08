import getPlayback from './getPlayback';
import { createSelector } from 'reselect';
import { get } from 'lodash-es';
import { State as Playback } from 'state/Playback/types';
import { State } from 'state/buildInitialState';

const getMuted: (a: State) => boolean = createSelector(
  getPlayback,
  (playback: Playback): boolean => get(playback, 'muted'),
);

export default getMuted;
