import extractLiveMetaContext from 'ads/slotControllers/lib/extractLiveMetaContext';
import isAdPlaying from 'ads/slotControllers/lib/isAdPlaying';
import liveAdswizzAdsController from 'ads/slotControllers/liveAdswizzAds/liveAdswizzAdsController';
import useLiveMetadata from 'ads/targeting/useLiveMetadata';
import useUnmount from 'hooks/useUnmount';
import wrapAdSlotMethods from 'ads/slotControllers/lib/wrapAdSlotMethods';
import { AUDIO_AD_PROVIDER } from 'ads/constants';
import { ControllerNames } from '../types';
import { getSubdomain } from 'state/Ads/selectors';
import { PLAYER_STATE } from 'constants/playback';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import type { AdSlotContainerInfo } from '../../types';

const useLiveAdswizzAds = (
  adSlotContainerConfig: AdSlotContainerInfo,
): void => {
  const {
    activeSlotController,
    setActiveSlotController,
    slotReady,
    defaultControllerName,
    persistPlaybackAds,
  } = adSlotContainerConfig;

  // Get the controller, ensure that we have exactly one instance per slot.
  const [liveAdswizzAds] = useState<
    ReturnType<typeof liveAdswizzAdsController>
  >(() =>
    wrapAdSlotMethods(liveAdswizzAdsController, {
      // TODO: Add error handling.
      onError: adSlotContainerConfig.onError,
    }),
  );

  const isActive = activeSlotController === ControllerNames.LiveAdswizz;

  const [isInitialized, setIsInitialized] = useState<boolean>(false);
  const [isPopulated, setIsPopulated] = useState<boolean>(false);

  const {
    liveMetaData,
    audioAdProvider,
    playbackState,
    adswizzZones,
    isGraceNoteAdvert,
  } = useLiveMetadata();
  const context = extractLiveMetaContext(liveMetaData);
  const adIsPlaying = isAdPlaying(liveMetaData, !!isGraceNoteAdvert);
  const adswizzSubdomain = useSelector(getSubdomain);

  const hasCompanion = !!context && context !== "''";

  // if an adswizz ad is playing then set the adswizz controller to active
  useEffect(() => {
    if (
      slotReady &&
      !isActive &&
      hasCompanion &&
      audioAdProvider === AUDIO_AD_PROVIDER.ADSWIZZ &&
      playbackState === PLAYER_STATE.PLAYING
    ) {
      setActiveSlotController(ControllerNames.LiveAdswizz);
    }
  }, [
    slotReady,
    isActive,
    context,
    audioAdProvider,
    playbackState,
    setActiveSlotController,
  ]);

  // once the ad ends relinquish active controller.
  // these cases handle slots that we want to handoff less aggressively (such as the right rail slot)
  const withPlaybackAdsPersisted = persistPlaybackAds && !context;
  // this case handles playback ads that handoff more agressively (such as the FSP slot)
  const withoutPlaybackAdsPersisted =
    !persistPlaybackAds && !(adIsPlaying || hasCompanion);
  // once the ad ends relinquish active controller.
  useEffect(() => {
    if (
      isActive &&
      (audioAdProvider !== AUDIO_AD_PROVIDER.ADSWIZZ ||
        playbackState !== PLAYER_STATE.PLAYING ||
        withPlaybackAdsPersisted ||
        withoutPlaybackAdsPersisted)
    ) {
      if (isInitialized && isPopulated) liveAdswizzAds.clear();
      setActiveSlotController(defaultControllerName);
    }
  }, [
    slotReady,
    isActive,
    context,
    audioAdProvider,
    playbackState,
    isInitialized,
    isPopulated,
    setActiveSlotController,
  ]);

  // Initialize everything (this only runs once).
  useEffect(() => {
    if (slotReady && isActive && !isInitialized) {
      liveAdswizzAds.initialize(adSlotContainerConfig);
      setIsInitialized(true);
    }
  }, [slotReady, isActive, isInitialized]);

  useEffect(() => {
    if (slotReady && isInitialized && isActive && hasCompanion) {
      liveAdswizzAds.setAdUnit(context as NonNullable<typeof context>);
      liveAdswizzAds.setTargeting({
        adswizzSubdomain,
        zoneId: adswizzZones?.['display-zone'] ?? null,
      });
      liveAdswizzAds.refresh();
      setIsPopulated(true);
    }
  }, [slotReady, isInitialized, isActive, context]);

  // Destroy.
  useUnmount(() => {
    if (isInitialized && isPopulated) liveAdswizzAds.destroy();
  });
};

export default useLiveAdswizzAds;
