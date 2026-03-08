import Logger, { CONTEXTS } from 'modules/Logger';
import { useCallback, useMemo, useRef } from 'react';
import type { PlaybackAdInterface } from 'ads/playback/lib/createPlaybackAdInterface';

/**
 * This hook should only be used internally, within the AdsPlayerProvider.
 * It manages playbackAdInterface lifecycles and provides a stateful
 * url value and load method (which will update the url)
 *
 * This hook should be the entrypoint for playbackAdInterfaces to be introduced
 * to the AdsPlayerProvider lifecycle
 */
function usePlaybackAds<
  PlaybackAdInterfaces extends Record<string, PlaybackAdInterface<any>>,
>(playbackAdInterfaces: PlaybackAdInterfaces) {
  type AdType = keyof PlaybackAdInterfaces;
  type ExposedMethods = Exclude<
    keyof PlaybackAdInterface,
    'load' | 'initialize' | 'destroy'
  >;

  const adTypeRef = useRef<null | AdType>(null);
  const playbackAds = useMemo<PlaybackAdInterfaces>(
    () => playbackAdInterfaces,
    [],
  );

  const execute = useCallback(
    (methodName: 'initialize' | 'destroy') => {
      Object.values(playbackAds).forEach(adType => {
        adType[methodName]();
      });
    },
    [playbackAds],
  );

  /**
   * Safely fires methods on the current playback ad interface.
   * These methods omit 'load', 'initialize', and 'destroy' as they are already
   * managed internally.
   */
  const triggerPlaybackMethod = useCallback(
    <MethodName extends ExposedMethods>(
      methodName: MethodName,
      data: Parameters<PlaybackAdInterfaces[AdType][MethodName]>[0],
    ) => {
      if (!adTypeRef.current) return;
      playbackAds[adTypeRef.current]?.[methodName]?.(data as any);
    },
    [playbackAds],
  );

  /**
   * Attempts to load an ad url for a target ad type. Will resolve either a string URL or null
   */
  const load = useCallback(
    async <TargetAdType extends AdType>(
      targetAdType: TargetAdType,
      targetAdData: Parameters<PlaybackAdInterfaces[TargetAdType]['load']>[0],
    ) => {
      adTypeRef.current = targetAdType;
      const targetInterface = playbackAds[adTypeRef.current];

      if (!targetInterface) {
        Logger.error(
          [CONTEXTS.PLAYBACK_ADS, 'usePlaybackAds', 'load'],
          new Error('invalid adType specified'),
        );
        return null;
      }

      // We return the newUrl as well, so that we can promise chain
      // the playback methods without requiring a re-render in react
      return (await targetInterface.load(targetAdData)) ?? null;
    },
    [playbackAds],
  );

  return useMemo(
    () => ({
      initialize: () => execute('initialize'),
      destroy: () => execute('destroy'),
      load,
      trigger: triggerPlaybackMethod,
    }),
    [execute, load, triggerPlaybackMethod],
  );
}

export default usePlaybackAds;
