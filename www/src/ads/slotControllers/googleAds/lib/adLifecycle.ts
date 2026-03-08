import createAdSlotNode from 'ads/slotControllers/lib/createAdSlotNode';
import gptPublisher from 'ads/scripts/gptPublisher';
import logger, { CONTEXTS } from 'modules/Logger';
import rejectPromiseOnTimeout from 'utils/rejectPromiseOnTimeout';
import { ControllerNames } from 'ads/slotControllers/types';
import { elementInViewport } from '../useGoogleAdsSetup';
import { fetchAmazonBids, loadAmazon } from 'ads/headerBidding/amazon';
import { fetchRubiconBids, loadRubicon } from 'ads/headerBidding/rubicon';
import { loadIndexExchange } from 'ads/headerBidding/indexExchange';
import { loadLiveRamp } from 'ads/headerBidding/liveRamp';

import { getPermutiveHashedId } from 'vendor/permutive';
import { isEqual } from 'lodash-es';
import type { AdUnit, EnabledHeaderBidders } from 'ads/types';
import type {
  GlobalTargetingValues,
  PageTargetingValues,
  PlayerTargetingValues,
} from 'ads/targeting/types';
import type { SlotDef } from 'ads/slotControllers/googleAds/useGoogleAdsPassThrough';
import type {
  SlotDefinitions,
  SlotElements,
  SlotInstances,
} from './useSlotCollection';
import type { SlotInstance } from '../types';
import type { TimeTargetingValues } from 'ads/targeting/useTimeTargeting';

// TODO: use a real type for the window sdk object
type GPT = (typeof window)['googletag'];

export async function clearSlot(slotId: string, slotInstance: SlotInstance) {
  await gptPublisher.enqueue(({ googleTag }) => {
    logger.info(
      [CONTEXTS.ADS, ControllerNames.Google],
      `clearing slot with id: ${slotId}`,
    );
    googleTag.pubads().clear([slotInstance]);
  });
}

export async function refreshSlots(
  slotIds: Array<string>,
  slotInstances: Array<SlotInstance>,
) {
  logger.info(
    [CONTEXTS.ADS, ControllerNames.Google],
    `refreshing slot(s) with id(s): ${slotIds.join(', ')}`,
  );
  gptPublisher.enqueue(({ googleTag }) => {
    googleTag.pubads().refresh(slotInstances);
  });
}

export async function resetSlot(
  slotId: string,
  { el: containerEl }: SlotDef,
  slotInstance: SlotInstance,
  slotEl?: HTMLElement,
) {
  logger.info(
    [CONTEXTS.ADS, ControllerNames.Google],
    `destroying slot with id: ${slotId}`,
  );

  if (slotEl) {
    try {
      containerEl?.removeChild?.(slotEl);
      // eslint-disable-next-line no-empty
    } catch (e) {}
  }

  // Destroy the slot service instance.
  await gptPublisher.enqueue(({ googleTag }) => {
    if (slotInstance) {
      googleTag.destroySlots([slotInstance]);
    }
  });
}

// the below functions are in the order that they are called and are grouped into the two enqueue calls in useGoogleAdsSetup
// the first enqueue handles global and slot level definition and targeting, the second enqueue is concerned with display logic

// first enqueue, slot level definition and targeting
export function initializeGPTSlots(
  googleTag: GPT,
  slotDefinitions: SlotDefinitions,
  slotInstances: SlotInstances,
  slotElements: SlotElements,
  lastAdUnitRef: { current: AdUnit },
  adUnit: AdUnit,
  {
    pageChanged,
    windowBecameActive,
  }: { pageChanged: boolean; windowBecameActive: boolean },
) {
  type InstancesAndElements = {
    instances: Record<string, SlotInstance>;
    elements: Record<string, HTMLElement>;
    errors: Record<string, Error>;
  };
  return slotDefinitions.reduce<InstancesAndElements>(
    (
      memo: InstancesAndElements,
      slotDef: SlotDef,
      slotId: string,
    ): InstancesAndElements => {
      try {
        logger.info(
          [CONTEXTS.ADS, ControllerNames.Google],
          `initializing slot with id: ${slotId}`,
        );
        let prevInstance = slotInstances.get(slotId);
        let prevElement: HTMLElement | undefined = slotElements.get(slotId);

        const {
          el,
          dimensions,
          slotDecorator,
          ccrpos,
          additionalTargeting,
          isActive,
        } = slotDef;

        if (!isActive)
          return {
            ...memo,
            instances: { ...memo.instances, [slotId]: prevInstance },
            elements: { ...memo.elements, [slotId]: prevElement! },
            errors: memo.errors,
          };

        if (
          (prevInstance && prevElement && lastAdUnitRef.current !== adUnit) ||
          (prevElement && !el?.hasChildNodes()) ||
          pageChanged ||
          windowBecameActive
        ) {
          // eslint-disable-next-line no-param-reassign
          lastAdUnitRef.current = adUnit;
          resetSlot(slotId, slotDef, prevInstance, prevElement);

          slotInstances.remove(slotId);
          slotElements.remove(slotId);
          prevInstance = undefined;
          prevElement = undefined;
        }

        let slotInstance = prevInstance;
        let slotElement = prevElement;

        if (!prevElement) {
          slotElement = createAdSlotNode(
            ControllerNames.Google,
            el!,
            slotId,
            'div',
            slotDecorator,
          );
        }

        if (!prevInstance) {
          logger.info(
            [CONTEXTS.ADS, ControllerNames.Google],
            `defining slot with id: ${slotId}`,
          );
          slotInstance = googleTag.defineSlot(adUnit, dimensions, slotId);
        }

        logger.info(
          [CONTEXTS.ADS, ControllerNames.Google],
          `settng new targeting for slot with id: ${slotId}`,
        );
        Object.entries({ dimensions, ccrpos, ...additionalTargeting }).forEach(
          ([key, value]) =>
            value !== null && value !== undefined ?
              slotInstance.setTargeting(key, String(value))
            : slotInstance.clearTargeting(key, value),
        );

        // Add the PubAds service to our instance.
        if (!prevInstance) {
          slotInstance.addService(googleTag.pubads());
        }

        if (slotInstance && slotElement) {
          return {
            instances: { ...memo.instances, [slotId]: slotInstance },
            elements: { ...memo.elements, [slotId]: slotElement! },
            errors: memo.errors,
          };
        } else {
          return memo;
        }
      } catch (e) {
        const err = e instanceof Error ? e : new Error(e as string);
        logger.error(
          [CONTEXTS.ADS, ControllerNames.Google, 'initializeGPTSlots', slotId],
          err,
        );
        return {
          ...memo,
          errors: {
            ...memo.errors,
            [slotId]: err,
          },
        };
      }
    },
    { instances: {}, elements: {}, errors: {} },
  ) as InstancesAndElements;
}

export async function fetchSlotHeaderBid(
  dimensions: Array<[number, number]>,
  slotInstance: SlotInstance,
  slotId: string,
  enabledHeaderBidders: EnabledHeaderBidders,
) {
  logger.info(
    [CONTEXTS.ADS, ControllerNames.Google],
    `fetching header bids for slot with id: ${slotId}`,
  );
  if (enabledHeaderBidders.amazon) {
    try {
      await fetchAmazonBids(slotId, dimensions);
    } catch (e) {
      logger.error([CONTEXTS.ADS, CONTEXTS.HEADER_BIDDING, 'amazon'], e);
    }
  }
  if (enabledHeaderBidders.rubicon) {
    try {
      await fetchRubiconBids(slotInstance, slotId);
    } catch (e) {
      logger.error([CONTEXTS.ADS, CONTEXTS.HEADER_BIDDING, 'rubicon'], e);
    }
  }
}

// first enqueue, slot level header bidding
export async function fetchAllHeaderBids(
  slotDefinitions: SlotDefinitions,
  slotInstances: SlotInstances,
  enabledHeaderBidders: EnabledHeaderBidders,
) {
  logger.info(
    [CONTEXTS.ADS, ControllerNames.Google],
    `fetching all header bids`,
  );
  await Promise.allSettled(
    slotDefinitions.map(async (slotDef, slotId) => {
      const { dimensions } = slotDef;
      const slotInstance = slotInstances.get(slotId);

      await fetchSlotHeaderBid(
        dimensions,
        slotInstance,
        slotId,
        enabledHeaderBidders,
      );
    }),
  );
  logger.info(
    [CONTEXTS.ADS, ControllerNames.Google],
    `all header bids fetched`,
  );
}

// first enqueue, global targeting
export function targetGPTGlobal(
  googleTag: GPT,
  {
    fixedTargetingValues,
    timeTargetingValues,
    pageTargetingValues,
    playerTargetingValues,
  }: {
    fixedTargetingValues: GlobalTargetingValues;
    timeTargetingValues: TimeTargetingValues;
    pageTargetingValues: PageTargetingValues;
    playerTargetingValues: PlayerTargetingValues;
  },
) {
  const contentTargetingObject = {
    ...playerTargetingValues,
    ...pageTargetingValues,
  };
  const targetingObject = {
    ...fixedTargetingValues,
    ...timeTargetingValues,
  };
  logger.info(
    [CONTEXTS.ADS, ControllerNames.Google],
    'setting global display ad targeting',
    {
      targetingObject,
      contentTargetingObject,
    },
  );

  // ensures that we clear values from previous content
  Object.entries(contentTargetingObject).forEach(([key, value]) => {
    if (googleTag.pubads().getTargeting(key) && !value) {
      googleTag.pubads().clearTargeting(key, String(value));
    }
    if (value) {
      googleTag.pubads().setTargeting(key, String(value));
    }
  });
  // sets values with previous values as defaults
  Object.entries(targetingObject).forEach(
    ([key, value]) =>
      value && googleTag.pubads().setTargeting(key, String(value)),
  );
}

// first enqueue, global configuration
export async function configureGPT(
  googleTag: GPT,
  {
    isPIIRestricted,
  }: {
    isPIIRestricted: boolean;
  },
) {
  logger.info(
    [CONTEXTS.ADS, ControllerNames.Google],
    `setting global configuration for display ads`,
  );

  googleTag.pubads().setPrivacySettings({
    restrictDataProcessing: isPIIRestricted,
  });

  // Allow us to display ads before GPT is loaded.
  googleTag.pubads().enableAsyncRendering();

  googleTag.pubads().collapseEmptyDivs(true);

  // makes all of the ad requests for a single page at once
  googleTag.pubads().enableSingleRequest();

  googleTag.pubads().disableInitialLoad();

  const hashedPermutiveId = await getPermutiveHashedId();

  if (hashedPermutiveId) {
    googleTag.pubads().setPublisherProvidedId(hashedPermutiveId);
  }

  googleTag.enableServices();
}

// second enqueue, displays slots defined in the first enqueue
export async function displayGPTSlots(
  googleTag: GPT,
  slotDefinitions: SlotDefinitions,
  slotInstances: SlotInstances,
  _slotElements: SlotElements,
  prevInstances: typeof slotInstances.current,
  {
    firstRenderReady,
    slotsNeedInstantiation,
    pageChanged,
    windowBecameActive,
  }: {
    firstRenderReady: boolean;
    slotsNeedInstantiation: boolean;
    pageChanged: boolean;
    windowBecameActive: boolean;
  },
): Promise<Array<{ error: Error; slotId: string }>> {
  // Not *entirely* sure why calling this here makes it work for Canada, but it also doesn't break
  // it for US - so... cést la vie
  googleTag.enableServices();
  const changedSlotIds = slotInstances.reduce<Array<string>>(
    (memo, instance, slotId) =>
      isEqual(prevInstances[slotId], slotInstances.get(slotId)) ? memo : (
        [...memo, slotId]
      ),
    [],
  );

  const displayErrors = await Promise.allSettled(
    slotInstances.map((slotInstance, slotId) => {
      const slotDef = slotDefinitions.get(slotId);
      const { visHandlers, isActive } = slotDef;

      if (!isActive) return Promise.resolve();

      let error: Error;
      const slotRenderedPromise = new Promise(resolve => {
        // resolve the promise only once the render is complete
        const slotResponseReceived = (event: SlotInstance) => {
          if (event.slot === slotInstance) {
            logger.info(
              [
                CONTEXTS.ADS,
                ControllerNames.Google,
                'slotResponseReceived',
                slotId,
              ],
              event,
            );
            googleTag
              .pubads()
              .removeEventListener(
                'slotResponseReceived',
                slotResponseReceived,
              );
            resolve({ error, slotId });
          }
        };
        googleTag
          .pubads()
          .addEventListener('slotResponseReceived', slotResponseReceived);
      });

      const slotRenderEnded = (event: {
        slot: SlotInstance;
        isEmpty: boolean;
      }) => {
        if (event.slot === slotInstance) {
          logger.info(
            [CONTEXTS.ADS, ControllerNames.Google, 'slotRenderEnded', slotId],
            { event, slotDef },
          );
          const { onEmpty, onPopulated } = visHandlers ?? {
            onEmpty: undefined,
            onPopulated: undefined,
          };

          if (onEmpty && event.isEmpty) onEmpty();
          if (onPopulated && !event.isEmpty) onPopulated();

          googleTag
            .pubads()
            .removeEventListener('slotRenderEnded', slotRenderEnded);
        }
      };

      googleTag.pubads().addEventListener('slotRenderEnded', slotRenderEnded);

      try {
        if (
          firstRenderReady ||
          slotsNeedInstantiation ||
          pageChanged ||
          changedSlotIds.length ||
          windowBecameActive
        ) {
          if (elementInViewport(slotDef.el?.parentElement)) {
            logger.info(
              [CONTEXTS.ADS, ControllerNames.Google],
              `requesting ad for slot with id: ${slotId}`,
            );
            googleTag.pubads().refresh(slotDef.el?.id);
          }
        }
      } catch (e) {
        error = e instanceof Error ? e : new Error(e as string);
        logger.error(
          [CONTEXTS.ADS, ControllerNames.Google, 'displayGPTSlots', slotId],
          error,
        );
        return { error, slotId };
      }
      return slotRenderedPromise;
    }),
  );
  return (displayErrors as Array<{ value: { error: Error; slotId: string } }>)
    .map(
      (promise: { value: { error: Error; slotId: string } }) => promise?.value,
    )
    .filter(value => Boolean(value?.error)) as Array<{
    error: Error;
    slotId: string;
  }>;
}

export function setChildDirectedTreament(childDirectedTreatment: boolean) {
  return gptPublisher.enqueue(({ googleTag }) => {
    logger.info(
      [CONTEXTS.ADS, ControllerNames.Google],
      `setting child directed treament to ${childDirectedTreatment}`,
    );
    googleTag.pubads().setPrivacySettings({
      childDirectedTreatment,
    });
  });
}

const HEADER_BIDDING_TIMEOUT = 3000; // ms
// separate useEffect, no enqueue, loads header bidding librarys
export function loadHeaderBidders(
  enabledHeaderBidders: EnabledHeaderBidders,
  {
    rubiconScriptUrl,
    apsScriptUrl,
    apsPubId,
    indexExchangeScriptUrl,
    liveRampScriptUrl,
  }: {
    rubiconScriptUrl: string;
    apsScriptUrl: string;
    apsPubId: string;
    indexExchangeScriptUrl: string;
    liveRampScriptUrl: string;
  },
  userEmail: string | null | undefined,
) {
  const rubiconLoaded =
    !enabledHeaderBidders.rubicon ?
      Promise.resolve()
    : rejectPromiseOnTimeout(
        loadRubicon(rubiconScriptUrl),
        HEADER_BIDDING_TIMEOUT,
      ).catch(e => {
        logger.error([CONTEXTS.ADS, CONTEXTS.HEADER_BIDDING, 'rubicon'], e);
        // eslint-disable-next-line no-param-reassign
        enabledHeaderBidders.rubicon = false;
      });

  const amazonLoaded =
    !enabledHeaderBidders.amazon ?
      Promise.resolve()
    : rejectPromiseOnTimeout(
        loadAmazon(apsScriptUrl, { apsPubId }),
        HEADER_BIDDING_TIMEOUT,
      ).catch(e => {
        logger.error([CONTEXTS.ADS, CONTEXTS.HEADER_BIDDING, 'amazon'], e);
        // eslint-disable-next-line no-param-reassign
        enabledHeaderBidders.amazon = false;
      });

  const indexExchangeLoaded =
    !enabledHeaderBidders.indexExchange ?
      Promise.resolve()
    : rejectPromiseOnTimeout(
        loadIndexExchange(indexExchangeScriptUrl),
        HEADER_BIDDING_TIMEOUT,
      ).catch(e => {
        logger.error(
          [CONTEXTS.ADS, CONTEXTS.HEADER_BIDDING, 'indexExchange'],
          e,
        );
        // eslint-disable-next-line no-param-reassign
        enabledHeaderBidders.indexExchange = false;
      });

  // LiveRamp programatic bidding requires the following to be true:
  // 1. rubicon to be defined (and loaded) for pb.js integration
  // 2. user is logged in (non anonymous)
  // 3. user has an email (ie not a facebook login etc)
  const liveRampLoaded =
    enabledHeaderBidders.rubicon && enabledHeaderBidders.liveRamp && userEmail ?
      // wait for rubicon to be loaded
      rubiconLoaded.then(() => {
        rejectPromiseOnTimeout(
          loadLiveRamp(liveRampScriptUrl, userEmail),
          HEADER_BIDDING_TIMEOUT,
        ).catch(e => {
          logger.error([CONTEXTS.ADS, CONTEXTS.HEADER_BIDDING, 'liveramp'], e);
          // eslint-disable-next-line no-param-reassign
          enabledHeaderBidders.liveRamp = false;
        });
      })
    : Promise.resolve();

  return Promise.allSettled([
    rubiconLoaded,
    amazonLoaded,
    indexExchangeLoaded,
    liveRampLoaded,
  ]);
}
