import createPlaybackAdInterface from 'ads/playback/lib/createPlaybackAdInterface';
import destroy from './destroy';
import initialize from './initialize';
import load from './load';
import { initialState } from './constants';
import { PlaybackAdTypes } from 'ads/playback/constants';
import type { CustomPrerollParams, State } from './types';

const createCustomPrerolls = () =>
  createPlaybackAdInterface<State, CustomPrerollParams>(
    initialState,
    {
      destroy,
      initialize,
      load,
    },
    PlaybackAdTypes.CustomPrerolls,
  );

export default createCustomPrerolls;
