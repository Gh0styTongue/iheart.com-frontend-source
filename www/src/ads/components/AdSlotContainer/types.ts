import * as React from 'react';
import RightRail from './primitives/RightRail';
import type { AdSlotContainerInfo } from 'ads/types';
import type { ControllerNames } from 'ads/slotControllers/types';

export type AdSlotContainerRef = { current: HTMLDivElement | null };

export type ContainerPrimitive = typeof RightRail;

export enum TakeoverTypes {
  WallpaperRight = 'WallpaperRight',
  WallpaperLeft = 'WallpaperLeft',
  Hero = 'Hero',
}

export type AdSlotContainerProps = Pick<
  AdSlotContainerInfo,
  'dimensions' | 'onError' | 'ccrpos'
> &
  React.HTMLAttributes<AdSlotContainerInfo['el']> & {
    onControllerChange?: (currentControllerName: ControllerNames) => void;
    ContainerPrimitive: ContainerPrimitive;
    takeoverType?: TakeoverTypes;
  };

export type AdSlotContainerType = React.FC<AdSlotContainerProps>;
