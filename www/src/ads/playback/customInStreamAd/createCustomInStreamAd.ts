import adCompanions from './adCompanions';
import complete from './complete';
import createPlaybackAdInterface from 'ads/playback/lib/createPlaybackAdInterface';
import destroy from './destroy';
import error from './error';
import initialize from './initialize';
import load from './load';
import play from './play';
import skip from './skip';
import { initialState } from './constants';
import { PlaybackAdTypes } from 'ads/playback/constants';
import type { CustomInStreamAdParams, State } from './types';

const createCustomInStreamAd = () =>
  createPlaybackAdInterface<State, CustomInStreamAdParams>(
    initialState,
    {
      adCompanions,
      complete,
      destroy,
      error,
      initialize,
      load,
      play,
      skip,
    },
    PlaybackAdTypes.CustomInStreamAd,
  );

export default createCustomInStreamAd;
