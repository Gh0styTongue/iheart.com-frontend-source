/* eslint-disable @typescript-eslint/no-non-null-assertion */
import createAdSlotNode, {
  buildSlotNodeId,
} from 'ads/slotControllers/lib/createAdSlotNode';
import getAdswizzCompanionUrl from './lib/getAdswizzCompanionUrl';
import { ControllerNames } from 'ads/slotControllers/types';
import { decorateAdswizzIframe } from 'ads/slotControllers/lib/slotDecorators';
import type { AdSlotContainerInfo, AdUnit } from 'ads/types';
import type { AdSlotControllerInstance } from 'ads/slotControllers/types';

export type LiveAdswizzAdsControllerInstance = Omit<
  Required<AdSlotControllerInstance>,
  'setEnabledHeaderBidders'
>;

const liveAdswizzAdsController = (): LiveAdswizzAdsControllerInstance => {
  let adSlotContainerInfo: AdSlotContainerInfo;

  let slotEl: ReturnType<typeof createAdSlotNode> | undefined;

  let adContext: string;
  let adswizzSubdomain: string;
  let zoneId: string;

  // Tracks if the slot has had at least one ad yet.
  let isBuilt = false;

  // Removes the current slot instance.
  const destroySlot = (): void => {
    if (!isBuilt) {
      return;
    }
    if (slotEl) adSlotContainerInfo?.el?.removeChild?.(slotEl);
    isBuilt = false;
  };

  return {
    name: ControllerNames.LiveAdswizz,

    initialize(containerInfo) {
      adSlotContainerInfo = containerInfo;
    },

    setAdUnit(adUnit: AdUnit) {
      adContext = adUnit;
    },

    setTargeting(targetingValues) {
      adswizzSubdomain = targetingValues.adswizzSubdomain as string;
      zoneId = targetingValues.zoneId as string;
    },

    /**
     * Called once to instantiate, again to rebuild with a new ad unit or new targeting.
     */
    async refresh() {
      if (isBuilt) {
        // if an ad was just playing with a display ad and we get another then we need to destroy that ad.
        destroySlot();
      }

      const src = getAdswizzCompanionUrl({
        adswizzSubdomain,
        context: adContext,
        zoneId,
      });

      const decorator: (el: HTMLElement) => void = (el: HTMLElement): void => {
        decorateAdswizzIframe(src, adSlotContainerInfo.dimensions)(el);
        adSlotContainerInfo?.slotDecorator?.(el);
      };

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      slotEl = createAdSlotNode(
        ControllerNames.LiveAdswizz,
        adSlotContainerInfo.el!,
        buildSlotNodeId(
          ControllerNames.LiveAdswizz,
          adSlotContainerInfo.dimensions,
        ),
        'iframe',
        // we need to ad some styles and other attrs to the iframe for it
        // to display correctly.
        decorator,
      );

      isBuilt = true;
    },

    async clear() {
      destroySlot();
    },

    async destroy() {
      destroySlot();
    },
  };
};

export default liveAdswizzAdsController;
