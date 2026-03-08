import { createContext } from 'react';
import type { CustomInStreamAdParams } from 'ads/playback/customInStreamAd/types';
import type { CustomPrerollParams } from 'ads/playback/customPrerolls/types';
import type { LivePrerollParams } from 'ads/playback/livePrerolls/types';
import type { PlaybackAdTypes } from 'ads/playback/constants';

export type LoadParamMap = {
  [PlaybackAdTypes.CustomInStreamAd]: CustomInStreamAdParams;
  [PlaybackAdTypes.CustomPrerolls]: CustomPrerollParams;
  [PlaybackAdTypes.LivePrerolls]: LivePrerollParams;
};

export type InferredLoadParam<T extends PlaybackAdTypes | null> =
  T extends PlaybackAdTypes ?
    LoadParamMap[T] extends void ?
      undefined
    : LoadParamMap[T]
  : undefined;

export type AdsPlayerContext = {
  /**
   * Plays the currently loaded ad url
   */
  play: (url?: string | null) => Promise<void>;
  /**
   * Loads an ad from the desired playbackAdInterface
   */
  load: <T extends PlaybackAdTypes | null>(
    type: T,
    data: InferredLoadParam<T>,
  ) => Promise<string | null>;
  /**
   * Skips a currently playing ad
   */
  skip: () => void;
  /**
   * Pauses or unpauses an ad
   */
  pause: (shouldPause: boolean) => void;
};

export const defaultContext: AdsPlayerContext = {
  play: async () => {},
  load: async () => null,
  skip: () => {},
  pause: () => {},
};

export default createContext<AdsPlayerContext>(defaultContext);
