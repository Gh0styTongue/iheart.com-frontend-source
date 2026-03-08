import useAdsContext from 'ads/components/AdsProvider/useAdsContext';
import { useMemo, useState } from 'react';
import type { AdSlotContainerInfo } from 'ads/types';
import type { AdSlotContainerProps, TakeoverTypes } from '../types';
import type { ControllerNames } from 'ads/slotControllers/types';

const DEFAULT_ADDITIONAL_TARGETING = {};
const DEFAULT_SLOT_DECORATOR = () => () => {};

export default function useAdSlot(
  {
    dimensions,
    onControllerChange,
    onError,
    ccrpos,
    ContainerPrimitive,
    ...divProps
  }: AdSlotContainerProps,
  {
    defaultControllerName,
    persistPlaybackAds,
    slotDecorator = DEFAULT_SLOT_DECORATOR,
    additionalTargeting = DEFAULT_ADDITIONAL_TARGETING,
    takeoverType,
    visHandlers,
  }: {
    defaultControllerName: ControllerNames;
    persistPlaybackAds: boolean;
    slotDecorator?: (slotEl: HTMLElement) => void;
    additionalTargeting?: Record<string, string>;
    takeoverType?: TakeoverTypes;
    visHandlers?: { onEmpty: () => void; onPopulated: () => void };
  } & Partial<AdSlotContainerInfo>,
): [JSX.Element | null, AdSlotContainerInfo] {
  // Persist our currently active slot controller.
  const [activeSlotController, setActiveSlotController] =
    useState<ControllerNames>(defaultControllerName);

  // we need to be able to run our hooks when the dom ref changes, so we can't use useRef
  const [containerRef, setContainerRef] = useState<HTMLDivElement | null>(null);

  // Get the biggest possible ad size
  const { isAdsEnabled } = useAdsContext();

  const [maxWidth] = dimensions.reduce(
    (
      [mWidth, mHeight]: [number, number],
      [width, height]: [number, number],
    ) => [mWidth > width ? mWidth : width, mHeight > height ? mHeight : height],
    [0, 0],
  );

  const controllerConfig = useMemo<AdSlotContainerInfo>(
    () => ({
      ccrpos,
      dimensions,
      el: containerRef,
      activeSlotController,
      setActiveSlotController: (controllerName: ControllerNames) => {
        setActiveSlotController(controllerName);
        onControllerChange?.(controllerName);
      },
      slotReady: isAdsEnabled && !!containerRef,
      onError,
      defaultControllerName,
      persistPlaybackAds,
      slotDecorator,
      takeoverType,
      additionalTargeting,
      visHandlers,
    }),
    [
      isAdsEnabled,
      dimensions,
      activeSlotController,
      setActiveSlotController,
      onError,
      onControllerChange,
      defaultControllerName,
      persistPlaybackAds,
      containerRef,
      slotDecorator,
      takeoverType,
      additionalTargeting,
      visHandlers,
    ],
  );

  return [
    isAdsEnabled ?
      <ContainerPrimitive
        maxWidthRem={maxWidth / 10}
        ref={setContainerRef}
        // eslint-disable-next-line react/jsx-props-no-spreading
        {...divProps}
      />
    : null,
    controllerConfig,
  ];
}
