import createAdSlotNode, {
  buildSlotNodeId,
} from 'ads/slotControllers/lib/createAdSlotNode';
import { ControllerNames } from 'ads/slotControllers/types';
import { decorateCustomCompanion } from 'ads/slotControllers/lib/slotDecorators';
import type { AdSlotContainerInfo, AdUnit } from 'ads/types';
import type { AdSlotControllerInstance } from 'ads/slotControllers/types';

export type CustomTritonAdsControllerInstance = Omit<
  Required<AdSlotControllerInstance>,
  'setEnabledHeaderBidders' | 'setTargeting'
>;

const customAdsController = (): CustomTritonAdsControllerInstance => {
  let adSlotContainerInfo: AdSlotContainerInfo;

  let slotEl: ReturnType<typeof createAdSlotNode> | undefined;

  let companionResource: string;

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
    name: ControllerNames.Custom,

    initialize(containerInfo) {
      adSlotContainerInfo = containerInfo;
    },

    setAdUnit(adUnit: AdUnit) {
      companionResource = adUnit;
    },

    /**
     * Called once to instantiate, again to rebuild with a new ad unit or new targeting.
     */
    async refresh() {
      if (isBuilt) {
        // if an ad was just playing with a display ad and we get another then we need to destroy that ad.
        destroySlot();
      }

      const decorator: (el: HTMLElement) => void = (el: HTMLElement): void => {
        decorateCustomCompanion(companionResource)(el);
        adSlotContainerInfo?.slotDecorator?.(el);
      };

      slotEl = createAdSlotNode(
        ControllerNames.Custom,
        adSlotContainerInfo.el!,
        buildSlotNodeId(ControllerNames.Custom, adSlotContainerInfo.dimensions),
        'div',
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

export default customAdsController;
