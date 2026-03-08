import useActiveWindow from './lib/useActiveWindow';
import useAdsContext from 'ads/components/AdsProvider/useAdsContext';
import useFeature from 'hooks/useFeature';
import useUnmount from 'hooks/useUnmount';
import { buildSlotNodeId } from 'ads/slotControllers/lib/createAdSlotNode';
import { ControllerNames } from '../types';
import { useEffect, useMemo, useRef } from 'react';
import type { AdSlotContainerInfo } from 'ads/types';

export type VisHandlers = { onEmpty: () => void; onPopulated: () => void };
export type SlotDef = Pick<
  AdSlotContainerInfo,
  | 'el'
  | 'dimensions'
  | 'ccrpos'
  | 'additionalTargeting'
  | 'takeoverType'
  | 'slotDecorator'
  | 'slotReady'
  | 'visHandlers'
  | 'onError'
> & { slotId: string; isActive: boolean };
type DefFromInfo = Omit<SlotDef, 'slotId' | 'isActive'>;
const infoKeys = [
  'el',
  'dimensions',
  'ccrpos',
  'additionalTargeting',
  'takeoverType',
  'slotDecorator',
  'slotReady',
  'visHandlers',
  'onError',
];

const useGoogleAdsPassThrough = (
  adSlotContainerConfig: AdSlotContainerInfo,
) => {
  const { activeSlotController, slotReady, ccrpos, dimensions, takeoverType } =
    adSlotContainerConfig;

  const { isActiveWindow } = useActiveWindow();
  const refreshAdOnFocus = useFeature('refreshAdOnFocus', false);

  const isActive =
    activeSlotController === ControllerNames.Google &&
    (!refreshAdOnFocus || isActiveWindow);

  const {
    google: { passSlotProps, slotInactive, unmountSlot },
  } = useAdsContext();

  const slotId = useMemo<string>(
    () =>
      buildSlotNodeId(
        ControllerNames.Google,
        dimensions,
        ccrpos,
        takeoverType || 'Page',
      ),
    [ccrpos, takeoverType, dimensions],
  );

  const slotDef = useMemo<SlotDef>(() => {
    const defFromInfo: DefFromInfo = infoKeys.reduce<Partial<DefFromInfo>>(
      (memo, key) => ({
        ...memo,
        [key]: adSlotContainerConfig[key as keyof DefFromInfo],
      }),
      {},
    ) as DefFromInfo;
    return {
      ...defFromInfo,
      slotId,
      isActive,
    };
  }, [adSlotContainerConfig, slotId, isActive]);

  const lastSlotIdRef = useRef(slotId);
  useEffect(() => {
    if (slotReady) {
      const lastSlotId = lastSlotIdRef.current;
      lastSlotIdRef.current = slotId;
      if (lastSlotId && lastSlotId !== slotId) {
        unmountSlot(lastSlotId);
      }

      if (!slotDef.isActive) {
        slotInactive(slotId);
      }

      passSlotProps(slotId, slotDef);
    }
  }, [passSlotProps, slotInactive, unmountSlot, slotDef, slotId, slotReady]);

  useUnmount(() => {
    unmountSlot(slotId);
  });
};

export default useGoogleAdsPassThrough;
