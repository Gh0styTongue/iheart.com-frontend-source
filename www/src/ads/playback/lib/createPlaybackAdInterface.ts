import AdsPlaybackStore from './createStore';
import Logger, { CONTEXTS } from 'modules/Logger';

/**
 * The produced dev facing API / interface
 */
export type PlaybackAdInterface<LoadParam = void> = {
  /**
   * Called to "initialize" the playback ad interface.
   * This method can be used to setup initial state
   */
  initialize: () => Promise<void>;
  /**
   * Called when an playback ad url should be requested
   * Should resolve a url or null;
   */
  load: (data: LoadParam) => Promise<string | null>;
  /**
   * Called when a playback ad url begins playing
   */
  play: (data: jwplayer.AdStartedParam) => Promise<void>;
  /**
   * Called when a playback ad's playback completes
   * Uses adBreakEnd under the hood in case a single url returns multiple ads
   */
  complete: (data: jwplayer.AdBreakParam) => Promise<void>;
  /**
   * Called when a playback ad is skipped
   */
  skip: () => Promise<void>;
  /**
   * Called when a playback ad error occurs.
   */
  error: (data: jwplayer.ErrorParam | jwplayer.AdErrorParam) => Promise<void>;
  /**
   * Called when a playback ad interface is destroyed
   * This method can be used to clean up state
   */
  destroy: () => Promise<void>;
  /**
   * Called when a playback ad has a display companion.
   */
  adCompanions: (companionData: jwplayer.AdCompanionsParam) => void;
};

/**
 * Represents the shape of passed in methods for the interface. Describes a function which will take in a store object, and return the dev facing function
 */
export type PlaybackAdMethods<State = unknown, LoadParam = void> = {
  [key in keyof PlaybackAdInterface<LoadParam>]: (
    store: Omit<AdsPlaybackStore<State>, 'state'>,
  ) => PlaybackAdInterface<LoadParam>[key];
};

/**
 * Makes every passed in method optional w/ the exception of 'load'
 */
type Methods<State, LoadParam> = Omit<
  Partial<PlaybackAdMethods<State, LoadParam>>,
  'load'
> & {
  load: PlaybackAdMethods<State, LoadParam>['load'];
};

/**
 * Creates an interface for playback ads. A playback ad can describe the following
 * - video prerolls
 * - audio prerolls
 * - custom in-stream audio ads
 *
 * The only required method is the load method, as that provides a url for a player to consume.
 * Every other method is optional and can be utilized to manage events within the ad's lifecycle
 */
function createPlaybackAdInterface<State = unknown, LoadParam = void>(
  initialState: State,
  methods: Methods<State, LoadParam>,
  adType: string,
): PlaybackAdInterface<LoadParam> {
  const adsPlaybackStore = new AdsPlaybackStore<State>(initialState);

  /**
   * Creates dev-facing interface methods with Logging injected
   */
  function createMethod<T extends keyof typeof methods>(name: T) {
    const method = methods[name]?.({
      getState: adsPlaybackStore.getState,
      setState: adsPlaybackStore.setState,
    });

    return ((arg: any) => {
      Logger.info([CONTEXTS.PLAYBACK_ADS, adType, name], {
        state: adsPlaybackStore.getState(),
        arg,
      });
      return method?.(arg);
    }) as PlaybackAdInterface<LoadParam>[T];
  }

  return {
    initialize: createMethod('initialize'),
    load: createMethod('load'),
    play: createMethod('play'),
    skip: createMethod('skip'),
    complete: createMethod('complete'),
    error: createMethod('error'),
    destroy: createMethod('destroy'),
    adCompanions: createMethod('adCompanions'),
  };
}

export default createPlaybackAdInterface;
