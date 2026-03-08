/**
 * Represents a particular space in the DOM in which a particular ad MAY appear.
 * This component serves to reserve that space and notify the ads controller
 * when that particular component is mounted and when it is unmounted.
 *
 * There should be minimal ads logic appearing in this component, as this serves
 * as the interface between ads control and their display within the DOM.
 *
 */

import * as React from 'react';
import useAdSlot from './lib/useAdSlot';
import useCustomAds from 'ads/slotControllers/customAds/useCustomAds';
import useLiveAdswizzAds from 'ads/slotControllers/liveAdswizzAds/useLiveAdswizzAds';
import useLiveTritonAds from 'ads/slotControllers/liveTritonAds/useLiveTritonAds';
import { ControllerNames } from 'ads/slotControllers/types';
import type { AdSlotContainerProps } from './types';

const PlaybackAdSlotContainer: React.FC<AdSlotContainerProps> = props => {
  const defaultControllerName = ControllerNames.None;

  const [adSlotComponent, controllerConfig] = useAdSlot(props, {
    defaultControllerName,
    persistPlaybackAds: false,
  });

  useLiveAdswizzAds(controllerConfig);
  useLiveTritonAds(controllerConfig);
  useCustomAds(controllerConfig);

  return adSlotComponent;
};

export default PlaybackAdSlotContainer;
