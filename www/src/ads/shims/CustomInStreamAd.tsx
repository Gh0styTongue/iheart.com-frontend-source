import getLegacyPlayerState from 'ads/playback/shims/getLegacyPlayerState';
import logger, { CONTEXTS } from 'modules/Logger';
import { createEmitter } from 'utils/createEmitter';
import { PlaybackAdTypes } from 'ads/playback/constants';
import { useAdsPlayer } from 'ads/playback';
import { useEffect } from 'react';
import type { FunctionComponent } from 'react';

export const customInstreamEmitter = createEmitter({
  play: () => {},
  complete: () => {},
});

const playerState = getLegacyPlayerState();

/**
 * This component's sole purpose is to serve as a bridge between legacy
 * playback & new ad playback. We don't want depend on Hub to tell new ads
 * it is time for a custom in-stream ad, so instead this component listens
 * to a piece of redux state which will tell it a custom in-stream has been requested.
 */
const CustomInStreamAd: FunctionComponent = () => {
  const adPlayer = useAdsPlayer();

  useEffect(() => {
    if (adPlayer && __CLIENT__) {
      return customInstreamEmitter.subscribe({
        async play() {
          const station = playerState.getStation();
          const { load, play } = adPlayer;

          const url = await load(PlaybackAdTypes.CustomInStreamAd, station);
          try {
            await play(url);
          } catch (err) {
            const e = err as Error;
            logger.error(
              [CONTEXTS.PLAYBACK, CONTEXTS.ADS],
              `error loading custom instream ad: ${e.message}`,
              e,
            );
          }
        },
      });
    }
    return () => {};
  }, [adPlayer]);

  return null;
};

export default CustomInStreamAd;
