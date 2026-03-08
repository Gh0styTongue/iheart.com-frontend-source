import extractLiveMetaContext from 'ads/slotControllers/lib/extractLiveMetaContext';
import isAdPlaying from 'ads/slotControllers/lib/isAdPlaying';
import liveTritonAdsController from 'ads/slotControllers/liveTritonAds/liveTritonAdsController';
import useLiveMetadata from 'ads/targeting/useLiveMetadata';
import useUnmount from 'hooks/useUnmount';
import wrapAdSlotMethods from 'ads/slotControllers/lib/wrapAdSlotMethods';
import { AUDIO_AD_PROVIDER } from 'ads/constants';
import { ControllerNames } from 'ads/slotControllers/types';
import { PLAYER_STATE } from 'constants/playback';
import { useEffect, useState } from 'react';
import type { AdSlotContainerInfo } from '../../types';

const useLiveTritonAds = (adSlotContainerConfig: AdSlotContainerInfo): void => {
  const {
    activeSlotController,
    setActiveSlotController,
    slotReady,
    defaultControllerName,
    persistPlaybackAds,
  } = adSlotContainerConfig;

  // Get the controller, ensure that we have exactly one instance per slot.
  const [liveTritonAds] = useState<ReturnType<typeof liveTritonAdsController>>(
    () =>
      wrapAdSlotMethods(liveTritonAdsController, {
        // TODO: Add error handling.
        onError: adSlotContainerConfig.onError,
      }),
  );

  const isActive = activeSlotController === ControllerNames.LiveTriton;

  const [isInitialized, setIsInitialized] = useState<boolean>(false);
  const [isPopulated, setIsPopulated] = useState<boolean>(false);

  const { liveMetaData, audioAdProvider, playbackState, isGraceNoteAdvert } =
    useLiveMetadata();
  const context = extractLiveMetaContext(liveMetaData);
  const adIsPlaying = isAdPlaying(liveMetaData, !!isGraceNoteAdvert);

  // blank context means we should keep showing what we're showing
  // if this controller is active, this keeps it active.
  const hasBlankContext = context === "''";
  const hasActualContext = !!context && !hasBlankContext;

  // if a triton ad is playing then set the triton controller to active
  useEffect(() => {
    if (
      slotReady &&
      !isActive &&
      hasActualContext &&
      audioAdProvider === AUDIO_AD_PROVIDER.TRITON &&
      playbackState === PLAYER_STATE.PLAYING
    ) {
      setActiveSlotController(ControllerNames.LiveTriton);
    }
  }, [
    slotReady,
    isActive,
    context,
    audioAdProvider,
    playbackState,
    setActiveSlotController,
  ]);

  // these cases handle slots that we want to handoff less aggressively (such as the right rail slot)
  const withPlaybackAdsPersisted =
    persistPlaybackAds && !(hasActualContext || hasBlankContext);
  // this case handles playback ads that handoff more agressively (such as the FSP slot)
  const withoutPlaybackAdsPersisted =
    !persistPlaybackAds && !(adIsPlaying || hasActualContext);
  // once the ad ends relinquish active controller.
  useEffect(() => {
    if (
      slotReady &&
      isActive &&
      (audioAdProvider !== AUDIO_AD_PROVIDER.TRITON ||
        playbackState !== PLAYER_STATE.PLAYING ||
        withPlaybackAdsPersisted ||
        withoutPlaybackAdsPersisted)
    ) {
      if (isInitialized && isPopulated) liveTritonAds.clear();
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
      liveTritonAds.initialize(adSlotContainerConfig);
      setIsInitialized(true);
    }
  }, [slotReady, isActive, isInitialized]);

  useEffect(() => {
    if (slotReady && isInitialized && isActive && hasActualContext) {
      liveTritonAds.setAdUnit(context as NonNullable<typeof context>);
      liveTritonAds.refresh().then(() => setIsPopulated(true));
    }
  }, [slotReady, isInitialized, isActive, context]);

  // Destroy.
  useUnmount(() => {
    if (isInitialized && isPopulated) liveTritonAds.destroy();
  });
};

export default useLiveTritonAds;
