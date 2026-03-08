/* eslint-disable @typescript-eslint/no-non-null-assertion */
import createAdSlotNode, {
  buildSlotNodeId,
} from 'ads/slotControllers/lib/createAdSlotNode';
import getNextTritonAd from 'ads/slotControllers/liveTritonAds/lib/getNextTritonAd';
import logger, { CONTEXTS } from 'modules/Logger';
import { ControllerNames } from 'ads/slotControllers/types';
import {
  decorateTritonHtml,
  decorateTritonIframe,
  decorateTritonStatic,
} from 'ads/slotControllers/lib/slotDecorators';
import type { AdSlotContainerInfo, AdUnit } from 'ads/types';
import type { AdSlotControllerInstance } from 'ads/slotControllers/types';
import type {
  HTMLResource,
  IFrameResource,
  StaticResource,
  ValidCompanionHeight,
  ValidDisplayCompanion,
} from 'iab-vast-parser';

export type LiveTritonAdsControllerInstance = Omit<
  Required<AdSlotControllerInstance>,
  'setTargeting' | 'setEnabledHeaderBidders'
>;

const liveTritonAdsController = (): LiveTritonAdsControllerInstance => {
  let adSlotContainerInfo: AdSlotContainerInfo;

  let slotEl: ReturnType<typeof createAdSlotNode> | undefined;

  let adContext: string;

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
    name: ControllerNames.LiveTriton,

    initialize(containerInfo) {
      adSlotContainerInfo = containerInfo;
    },

    setAdUnit(adUnit: AdUnit) {
      adContext = adUnit;
    },

    /**
     * Called once to instantiate, again to rebuild with a new ad unit or new targeting.
     */
    async refresh() {
      if (isBuilt) {
        // if an ad was just playing with a display ad and we get another then we need to destroy that ad.
        destroySlot();
      }

      // TODO: What happens if we refresh before this is complete?
      const {
        height = 250,
        type,
        companion,
      } = (await getNextTritonAd(adContext)) ?? {};
      if (type === 'iframe') {
        const decorator = decorateTritonIframe(
          height as ValidCompanionHeight,
          companion as ValidDisplayCompanion<IFrameResource>,
        );

        // simplest case, the api gives us an iframe src that's loaded simply
        slotEl = createAdSlotNode(
          ControllerNames.LiveTriton,
          adSlotContainerInfo.el!,
          buildSlotNodeId(
            ControllerNames.LiveTriton,
            adSlotContainerInfo.dimensions,
          ),
          'iframe',
          // we need to ad some styles and other attrs to the iframe for it
          // to display correctly.
          (el: HTMLElement) => {
            decorator(el);
            adSlotContainerInfo?.slotDecorator?.(el);
          },
        );
      } else if (type === 'html') {
        const decorator = decorateTritonHtml(
          companion as ValidDisplayCompanion<HTMLResource>,
        );
        // we've been given literal html that needs to be written into a div.
        slotEl = createAdSlotNode(
          ControllerNames.LiveTriton,
          adSlotContainerInfo.el!,
          buildSlotNodeId(
            ControllerNames.LiveTriton,
            adSlotContainerInfo.dimensions,
          ),
          'div',
          // simply set innerHTML
          (el: HTMLElement) => {
            decorator(el);
            adSlotContainerInfo?.slotDecorator?.(el);
          },
        );
      } else if (type === 'static') {
        const decorator = decorateTritonStatic(
          companion as ValidDisplayCompanion<StaticResource>,
        );
        // we've been given an img src and potentially a link to wrap it in.

        slotEl = createAdSlotNode(
          ControllerNames.LiveTriton,
          adSlotContainerInfo.el!,
          buildSlotNodeId(
            ControllerNames.LiveTriton,
            adSlotContainerInfo.dimensions,
          ),
          'div',
          // we need to append several nodes with specific styles and attrs for the ad
          // to display and behave correctly as well as some tracking pixels.
          (el: HTMLElement) => {
            decorator(el);
            adSlotContainerInfo?.slotDecorator?.(el);
          },
        );
      }

      if (type) {
        isBuilt = true;
      } else {
        logger.info(
          [CONTEXTS.ADS, ControllerNames.LiveTriton],
          `live triton ad with context ("${adContext}") has no valid companion!`,
        );
        isBuilt = false;
      }
    },

    async clear() {
      destroySlot();
    },

    async destroy() {
      destroySlot();
    },
  };
};

export default liveTritonAdsController;
