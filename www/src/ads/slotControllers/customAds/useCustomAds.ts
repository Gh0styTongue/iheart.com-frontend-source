import customAdsController from 'ads/slotControllers/customAds/customAdsController';
import useCustomCompanion from 'ads/targeting/useCustomCompanion';
import useUnmount from 'hooks/useUnmount';
import wrapAdSlotMethods from 'ads/slotControllers/lib/wrapAdSlotMethods';
import { ControllerNames } from 'ads/slotControllers/types';
import { useEffect, useState } from 'react';
import type { AdSlotContainerInfo } from '../../types';

const useCustomAds = (adSlotContainerConfig: AdSlotContainerInfo): void => {
  const {
    activeSlotController,
    setActiveSlotController,
    slotReady,
    defaultControllerName,
  } = adSlotContainerConfig;

  // Get the controller, ensure that we have exactly one instance per slot.
  const [customAds] = useState<ReturnType<typeof customAdsController>>(() =>
    wrapAdSlotMethods(customAdsController, {
      // TODO: Add error handling.
      onError: adSlotContainerConfig.onError,
    }),
  );

  const isActive = activeSlotController === ControllerNames.Custom;

  const [isInitialized, setIsInitialized] = useState<boolean>(false);
  const [isPopulated, setIsPopulated] = useState<boolean>(false);

  const { customAdCompanionData, isPlaying } = useCustomCompanion();

  const companion = customAdCompanionData?.resource;

  // if a custom ad with a companion is playing then set the  controller to active
  useEffect(() => {
    if (slotReady && !isActive && companion && isPlaying) {
      setActiveSlotController(ControllerNames.Custom);
    }
  }, [slotReady, isActive, companion, isPlaying, setActiveSlotController]);

  // once the ad ends relinquish active controller.
  useEffect(() => {
    if (slotReady && isActive && (!isPlaying || !companion)) {
      if (isInitialized && isPopulated) customAds.clear();
      setActiveSlotController(defaultControllerName);
    }
  }, [
    companion,
    slotReady,
    isActive,
    isPlaying,
    isInitialized,
    isPopulated,
    setActiveSlotController,
  ]);

  // Initialize everything (this only runs once).
  useEffect(() => {
    if (slotReady && isActive && !isInitialized) {
      customAds.initialize(adSlotContainerConfig);
      setIsInitialized(true);
    }
  }, [slotReady, isActive, isInitialized]);

  useEffect(() => {
    if (slotReady && isInitialized && isActive && companion) {
      customAds.setAdUnit(customAdCompanionData);
      customAds.refresh();
      setIsPopulated(true);
    }
  }, [slotReady, isInitialized, isActive, companion]);

  // Destroy.
  useUnmount(() => {
    if (isInitialized && isPopulated) customAds.destroy();
  });
};

export default useCustomAds;
