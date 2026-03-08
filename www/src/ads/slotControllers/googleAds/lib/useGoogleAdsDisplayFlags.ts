import gptPublisher from 'ads/scripts/gptPublisher';
import useActiveWindow from './useActiveWindow';
import useFeature from 'hooks/useFeature';
import { useMemo } from 'react';
import type { AdsConfig } from 'ads/types';
import type { SlotDefinitions, SlotInstances } from './useSlotCollection';

export default function useGoogleAdsDisplayFlags(
  adsConfig: AdsConfig,
  {
    slotDefinitions,
    slotInstances,
  }: { slotInstances: SlotInstances; slotDefinitions: SlotDefinitions },
  isPubadsReady: boolean,
  forceRerender: number,
  adUnit: string,
  lastRouteKey: string | null | undefined,
): {
  nextRenderReady: boolean;
  firstRenderReady: boolean;
  pageChanged: boolean;
  slotsNeedInstantiation: boolean;
  forceRerender: number;
  windowBecameActive: boolean;
} {
  const { isActiveWindow, activeWindowChanged } = useActiveWindow();
  const refreshAdOnFocus = useFeature('refreshAdOnFocus', false);

  return useMemo(() => {
    const { isAdsEnabled, pageInfo } = adsConfig;
    const windowBecameActive =
      refreshAdOnFocus && isActiveWindow && activeWindowChanged;

    const dataSettled =
      !!adUnit &&
      !!pageInfo &&
      (pageInfo.initialRender ||
        !!(
          pageInfo.pageId ||
          pageInfo.targeting ||
          pageInfo.targeting?.['aw_0_1st.playlistid'] ||
          pageInfo.routeKey
        ));

    // first render technically shouldn't need both isPubAdsReady and isLoadedCalled (if the script
    // hasn't loaded then pubAds isn't ready), but it makes it explicit that firstRenderReady and nextRenderReady
    // cannot be true simultaneously.
    const firstRenderReady =
      (!refreshAdOnFocus || isActiveWindow) &&
      !isPubadsReady &&
      !gptPublisher.isLoadedCalled &&
      isAdsEnabled &&
      !!slotDefinitions.length &&
      dataSettled;

    const ready = isPubadsReady && isAdsEnabled;

    const pageChanged =
      (pageInfo.initialRender && !isPubadsReady) ||
      (!!pageInfo.routeKey && pageInfo.routeKey !== lastRouteKey);

    const slotsNeedInstantiation =
      !!slotDefinitions.length &&
      slotDefinitions.some((_slotDef, slotId) => !slotInstances.get(slotId));

    const nextRenderReady =
      (!refreshAdOnFocus || isActiveWindow) &&
      ready &&
      dataSettled &&
      (slotsNeedInstantiation || !!pageChanged || windowBecameActive);

    return {
      nextRenderReady,
      firstRenderReady,
      pageChanged,
      slotsNeedInstantiation,
      forceRerender,
      windowBecameActive,
    };
  }, [
    adUnit,
    adsConfig,
    isPubadsReady,
    slotDefinitions,
    slotInstances,
    forceRerender,
    isActiveWindow,
    activeWindowChanged,
    lastRouteKey,
    refreshAdOnFocus,
  ]);
}
