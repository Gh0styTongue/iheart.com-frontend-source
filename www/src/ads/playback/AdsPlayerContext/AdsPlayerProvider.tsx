import AdsPlayerContext from './AdsPlayerContext';
import AdsPlayerWrapper from './primitives/AdsPlayerWrapper';
import customInStreamAd from 'ads/playback/customInStreamAd';
import customPrerolls from 'ads/playback/customPrerolls';
import getAdPlayer from './lib/getPlayer';
import livePrerolls from 'ads/playback/livePrerolls';
import Logger, { CONTEXTS } from 'modules/Logger';
import parseVAST from 'iab-vast-parser';
import useAdsPlayerActions from 'ads/playback/AdsPlayerState/useAdsPlayerActions';
import useAdsPlayerState from 'ads/playback/AdsPlayerState/useAdsPlayerState';
import useMount from 'hooks/useMount';
import usePlaybackAds from './lib/usePlaybackAds';
import { AD_PLAYER_ID } from './lib/constants';
import { AdMediaType, AdPlaybackState } from '../AdsPlayerState/AdsPlayerState';
import { getMuted, getVolume } from 'state/Playback/selectors';
import { throttle } from 'lodash-es';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import type { AdsPlayerContext as AdsPlayerContextType } from 'ads/playback/types';
import type { FunctionComponent } from 'react';

import { blankMP4 } from 'constants/assets';
import { getEnv } from 'state/Environment/selectors';
import { getIAS } from 'state/Ads/selectors';
import { getPiiBlockingTypes } from 'state/Profile/selectors';
import { isPrivacyOptOut } from 'state/Profile/actions';

const noop = () => {};

const LOGGING_CONTEXT = 'JW Instance';
const messageWithContext = (name: string) => [
  CONTEXTS.ADS,
  CONTEXTS.PLAYBACK_ADS,
  LOGGING_CONTEXT,
  name,
];

const AdsPlayerProvider: FunctionComponent = ({ children }) => {
  // Internal State
  const [player, setPlayer] = useState<null | jwplayer.JWPlayer>(null);
  const [adUrl, setAdUrl] = useState<null | string>(null);
  const [isAdBlocked, setIsAdBlocked] = useState(false);

  // External State which is managed by AdsPlayerProvider
  const { adIsPresent, adPlaybackState, adMediaType } = useAdsPlayerState();
  const { setAdMediaType, setAdPlaybackState, setAdTime } =
    useAdsPlayerActions();

  const playbackAds = usePlaybackAds({
    CustomInStreamAd: customInStreamAd,
    CustomPrerolls: customPrerolls,
    LivePrerolls: livePrerolls,
  });

  const resolvePlay = useRef<() => void>(noop);
  const rejectPlay =
    useRef<
      (error: jwplayer.ErrorParam | jwplayer.AdErrorParam | Error) => void
    >(noop);
  const timeoutInstance = useRef<ReturnType<typeof setTimeout> | null>(null);
  const adBegun = useRef<boolean>(false);
  const adTimeoutFired = useRef<boolean>(false);
  const clearAdPlayTimeout = useCallback(() => {
    adBegun.current = true;
    if (timeoutInstance.current) {
      clearTimeout(timeoutInstance.current);
      timeoutInstance.current = null;
    }
  }, []);
  const settlePlayPromise = useCallback(
    async (error?: jwplayer.ErrorParam | jwplayer.AdErrorParam | Error) => {
      if (!error) {
        resolvePlay.current();
      } else {
        if ('tag' in error) {
          const adUrlWithError = error?.tag;

          const errorRepsonseXML = await fetch(adUrlWithError, {
            credentials: 'omit',
            redirect: 'follow',
          });

          const response = await errorRepsonseXML.text();

          const responseVast = parseVAST(response);
          const { errors = [] } = responseVast;

          for (let i = 0; i < errors.length; i += 1) {
            const errorUrl = errors[i];
            fetch(new URL(errorUrl.replace('%5BTD_DURATION%5D', '30')));
          }
        }

        rejectPlay.current(error);
      }
      resolvePlay.current = noop;
      rejectPlay.current = noop;
      clearAdPlayTimeout();
    },
    [],
  );

  useMount(() => {
    getAdPlayer(playerInstance => {
      // this needs to be up here to ensure that the ready handler is attached before the event fires
      playerInstance.on('ready', data => {
        Logger.info(messageWithContext('ready'), data);
        playbackAds.initialize();
      });
      setPlayer(playerInstance);
    });
  });

  const volume = useSelector(getVolume);
  const mute = useSelector(getMuted);
  const ias = useSelector(getIAS);
  const env = useSelector(getEnv);

  const piiBlockingTypes = useSelector(getPiiBlockingTypes);
  const isOptout = isPrivacyOptOut(piiBlockingTypes);

  ias.enabled = ias.enabled && !isOptout;

  useEffect(() => {
    if (player) {
      player.setVolume(volume);
    }
  }, [player, volume]);
  useEffect(() => {
    if (player) {
      if (mute) {
        player.setMute(true);
      } else {
        player.setMute(false);
      }
    }
  }, [player, mute]);

  /**
   * Fires after an ad's playback ends due to completion or error
   */
  const clearAd = useCallback(
    (error?: jwplayer.ErrorParam | jwplayer.AdErrorParam | Error) => {
      setAdPlaybackState(AdPlaybackState.Idle);
      setAdMediaType(null);
      setAdTime(null);
      settlePlayPromise(error);
      // playing "music" pre-empts any playAd call that occured before clearAd was called
      player?.load?.([
        {
          file: blankMP4,
          type: 'mp4',
          preload: 'auto',
        },
      ]);
      player?.play();
    },
    [player, settlePlayPromise, setAdMediaType, setAdTime, setAdPlaybackState],
  );

  const adTime = useCallback(
    throttle((data: jwplayer.AdTimeParam) => {
      Logger.info(messageWithContext('adTime'), data);

      const { duration, position } = data;
      setAdTime({ duration, position });
    }, 1000),
    [setAdTime],
  );

  const adManager = useCallback(
    async (e: any) => {
      const { adsManager, videoElement } = e;

      if (ias.enabled && ias.anID) {
        const adURL = new URLSearchParams(adsManager.adTagUrl);

        const iasConfig = {
          anId: ias.anID,
          campId: adURL?.get('sz'),
          chanId: adURL?.get('iu'),
          env,
          placementId: 'Open Auction',
          pubOrder: 'Video',
          pubId: 'Direct',
          pubCreative: 'Default Creative',
        };
        if (window.googleImaVansAdapter) {
          window.googleImaVansAdapter.init(
            window.google,
            adsManager,
            videoElement,
            iasConfig,
          );
        }

        Logger.info(messageWithContext('adsManager'), iasConfig);
      }
    },
    [env, ias.enabled, ias.anID],
  );

  useEffect(() => {
    /**
     * This logic attaches listeners to jw's events.
     * We currently leverage this for the following:
     * 1. Logging
     * 2. UI updates
     * 3. Binding our playback ad interface events to the player via the trigger method
     */
    if (player) {
      // The getAdBlock method exists, but the typing does not reflect that.
      setIsAdBlocked((player as any)?.getAdBlock());

      player.on('adBreakStart', data => {
        Logger.info(messageWithContext('adBreakStart'), data);
        clearAdPlayTimeout();
        if (adTimeoutFired.current) clearAd();
      });

      player.on('adStarted', data => {
        Logger.info(messageWithContext('adStarted'), data);
        setAdUrl(null);
        setAdMediaType(
          data.creativetype.startsWith('audio') ?
            AdMediaType.Audio
          : AdMediaType.Video,
        );
        playbackAds.trigger('play', data);
      });

      player.on('adPlay', data => {
        Logger.info(messageWithContext('adPlay'), data);
      });

      player.on('adPause', data => {
        Logger.info(messageWithContext('adPause'), data);
      });

      player.on('adBreakEnd', data => {
        Logger.info(messageWithContext('adBreakEnd'), data);
        clearAd();
        playbackAds.trigger('complete', data);
      });

      player.on('adCompanions', data => {
        Logger.info(messageWithContext('adCompanions'), data);
        playbackAds.trigger('adCompanions', data);
      });

      player.on('adTime', adTime);

      player.on('adError', e => {
        Logger.error(messageWithContext('adError'), e);
        // adStarted won't fire if we have an error, and it's safe to assume we have a bad url if it did error
        setAdUrl(null);
        clearAd(e);
        playbackAds.trigger('error', e);
      });

      player.on('error', e => {
        Logger.error(messageWithContext('error'), e);
        setAdUrl(null);
        clearAd(e);
        playbackAds.trigger('error', e);
      });

      player.on('adsManager', async e => {
        Logger.info(messageWithContext('adsManager'), e);
        await adManager(e);
      });

      return playbackAds.destroy;
    }

    return undefined;
  }, [player, adTime, clearAd, setAdMediaType, playbackAds]);

  /**
   * Thin wrapper around playbackAds.load()
   * It will store the returned url in state so that we can preload urls
   * It also returns the url so that we can chain a load() call into play()
   * if we want to immediately play the ad.
   */
  const load: AdsPlayerContextType['load'] = useCallback(
    async (adType, targetAdData) => {
      if (isAdBlocked || !adType || !player) {
        setAdUrl(null);
        return null;
      }

      try {
        const newUrl = await playbackAds.load(
          adType as NonNullable<typeof adType>,
          targetAdData!,
        );
        if (newUrl) {
          const newAdUrl = new URL(newUrl);
          if (newAdUrl.searchParams.has('cust_params')) {
            const customParams = decodeURIComponent(
              newAdUrl.searchParams.get('cust_params')!,
            );
            const paramsArray = customParams.split('&');
            if (paramsArray.length > 0) {
              const newCustomParams = new URLSearchParams();
              paramsArray.forEach(param => {
                const [key, value] = param.split('=');
                if (key && value) {
                  newCustomParams.append(key, value);
                }
              });
              newCustomParams.append('ihrtoo', isOptout ? '0' : '1');
              newAdUrl.searchParams.set(
                'cust_params',
                newCustomParams.toString(),
              );
            }
          } else {
            newAdUrl.searchParams.set(
              'cust_params',
              `ihrtoo=${isOptout ? '0' : '1'}`,
            );
          }
          setAdUrl(newAdUrl.toString());
          return newAdUrl.toString();
        } else {
          setAdUrl(null);
          return null;
        }
      } catch {
        setAdUrl(null);
        return null;
      }
    },
    [player, isAdBlocked, playbackAds.load],
  );

  /**
   * Attempts to play an adUrl.
   * Optionally accepts a url to force, otherwise pulls the url from playbackAd state
   * If there is no url, the app is adBlocked, or the ad is already playing, no-op.
   */
  const play: AdsPlayerContextType['play'] = useCallback(
    async (url): Promise<void> => {
      /**
       * No-op if:
       * 1. No ad to play
       * 2. App is adBlocked
       * 3. An ad is already playing.
       *
       * In case #3 we still want to resolve as it most likely means a user
       * is attempting to change stations. This scenario will not apply to video prerolls
       * as a user cannot interact with the UI during that ad type.
       */
      try {
        const shouldSkip =
          isAdBlocked || adPlaybackState !== AdPlaybackState.Idle || !player;
        // Only fallback to adUrl if no url param was specified. We check against undefined because
        // play() can be called with a null url
        const urlToPlay = url === undefined ? adUrl : url;
        if (!urlToPlay || shouldSkip) {
          return Promise.resolve();
        }

        setAdPlaybackState(AdPlaybackState.Buffering);
        adBegun.current = false;
        adTimeoutFired.current = false;
        if (timeoutInstance.current) clearTimeout(timeoutInstance.current);
        player?.playAd(urlToPlay);
        return new Promise((resolve, reject) => {
          resolvePlay.current = resolve;
          rejectPlay.current = reject;
          timeoutInstance.current = setTimeout(() => {
            adTimeoutFired.current = true;
            if (!adBegun.current) {
              // clearAd will call the rejectPlay callback set above
              clearAd(
                new Error('jw failed to play an ad after 3 seconds, Bummer!'),
              );
            }
          }, 5000);
        });
      } catch (e) {
        return Promise.reject(e);
      }
    },
    [adPlaybackState, adUrl, clearAd, isAdBlocked, player, setAdPlaybackState],
  );

  /**
   * Skips an ad... the hard way
   * player.skipAd does not immediately skip the ad, which would be fine,
   * however it doesn't even trigger the 'adSkipped' event, so we cannot use it.
   * Instead, we have to use player.pauseAd. Icing on the cake is that neither
   * pauseAd nor skipAd are on the jw typedefs, yet they are on the API reference
   * https://developer.jwplayer.com/jwplayer/docs/jw8-javascript-api-reference#jwplayeronadpause
   */
  const skip: AdsPlayerContextType['skip'] = useCallback(() => {
    if (!adIsPresent || !player) return;

    player.pauseAd(true);
    clearAd();
    playbackAds.trigger('skip', undefined);
  }, [adIsPresent, player, clearAd, playbackAds]);

  /**
   * Pauses an ad
   */
  const pause: AdsPlayerContextType['pause'] = useCallback(
    (shouldPause: boolean) => {
      if (adIsPresent && player) {
        player.pauseAd(shouldPause);

        if (shouldPause) {
          setAdPlaybackState(AdPlaybackState.Paused);
        } else {
          setAdPlaybackState(AdPlaybackState.Playing);
        }
      }
    },
    [adIsPresent, player, setAdPlaybackState],
  );

  return (
    <AdsPlayerContext.Provider value={{ play, load, skip, pause }}>
      {children}
      <AdsPlayerWrapper
        isVisible={adIsPresent && adMediaType === AdMediaType.Video}
      >
        <div id={AD_PLAYER_ID} />
      </AdsPlayerWrapper>
    </AdsPlayerContext.Provider>
  );
};

export default AdsPlayerProvider;
