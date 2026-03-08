import complete from './complete';
import createPlaybackAdInterface from 'ads/playback/lib/createPlaybackAdInterface';
import destroy from './destroy';
import initialize from './initialize';
import load from './load';
import { initialState } from './constants';
import { PlaybackAdTypes } from 'ads/playback/constants';

const createLivePrerolls = () =>
  createPlaybackAdInterface(
    initialState,
    {
      initialize,
      load,
      complete,
      destroy,
    },
    PlaybackAdTypes.LivePrerolls,
  );

export default createLivePrerolls;
