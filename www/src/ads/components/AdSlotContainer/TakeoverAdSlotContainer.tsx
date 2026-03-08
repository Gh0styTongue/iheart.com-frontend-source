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
import useGoogleAdsPassThrough, {
  VisHandlers,
} from 'ads/slotControllers/googleAds/useGoogleAdsPassThrough';
import { ControllerNames } from 'ads/slotControllers/types';
import {
  heroTakeoverSlotDecorator,
  makeTakeoverDecorator,
} from 'ads/slotControllers/lib/slotDecorators';
import { TakeoverTypes } from './types';
import { useMemo } from 'react';
import type { AdSlotContainerProps } from './types';

// Lost? Confused?  Wondering WTF is happening here?  This interacts with code snippets generated based on https://github.com/iheartradio/custom-pylon/tree/prod/ads/dev/v4
// tool can be accessed locally after pulling down the repo by opening /custom-pylon/ads/dev/v4/index.html in your browser
// production hosted here: http://pylon.iheart.com/ads/dev/v2/
// staging hosted here: http://pylon.pages.ihrdev.com/ads/dev/v2/
// May God Have Mercy On Our Souls

const slotDecorators: Record<TakeoverTypes, (slotEl: HTMLElement) => void> = {
  [TakeoverTypes.WallpaperLeft]: makeTakeoverDecorator(
    'leftImg',
    TakeoverTypes.WallpaperLeft,
  ),
  [TakeoverTypes.WallpaperRight]: makeTakeoverDecorator(
    'rightImg',
    TakeoverTypes.WallpaperRight,
  ),
  [TakeoverTypes.Hero]: heroTakeoverSlotDecorator,
};

const additionalTargeting = {
  [TakeoverTypes.WallpaperLeft]: {
    rail: 'left',
    wallpaperCB: TakeoverTypes.WallpaperLeft,
  },
  [TakeoverTypes.WallpaperRight]: {
    rail: 'right',
    wallpaperCB: TakeoverTypes.WallpaperRight,
  },
  [TakeoverTypes.Hero]: { heroCB: TakeoverTypes.Hero },
};

const TakeoverAdSlotContainer: React.FC<
  {
    takeoverType: TakeoverTypes;
    onEmpty: () => void;
    onPopulated: () => void;
  } & AdSlotContainerProps
> = ({ takeoverType, onEmpty, onPopulated, ...props }) => {
  const defaultControllerName = ControllerNames.Google;

  const [adSlotComponent, controllerConfig] = useAdSlot(props, {
    defaultControllerName,
    persistPlaybackAds: true,
    slotDecorator: slotDecorators[takeoverType!],
    takeoverType,
    additionalTargeting: additionalTargeting[takeoverType!],
    visHandlers: useMemo<VisHandlers>(
      () => ({
        onEmpty,
        onPopulated,
      }),
      [onEmpty, onPopulated],
    ),
  });

  useGoogleAdsPassThrough(controllerConfig);

  return adSlotComponent;
};

export default TakeoverAdSlotContainer;
