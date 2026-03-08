import gptPublisher from 'ads/scripts/gptPublisher';
import logger, { CONTEXTS } from 'modules/Logger';
import useAdUnit from 'ads/targeting/useAdUnit';
import useGoogleAdsDisplayFlags from './lib/useGoogleAdsDisplayFlags';
import usePageTargeting from 'ads/targeting/usePageTargeting';
import usePlayerTargeting from 'ads/targeting/usePlayerTargeting';
import useSlotCollection from 'ads/slotControllers/googleAds/lib/useSlotCollection';
import useTimeTargeting from 'ads/targeting/useTimeTargeting';
import useUserTargeting from 'ads/targeting/useUserTargeting';
import {
  clearSlot,
  configureGPT,
  displayGPTSlots,
  fetchAllHeaderBids,
  initializeGPTSlots,
  loadHeaderBidders,
  refreshSlots,
  resetSlot,
  setChildDirectedTreament,
  targetGPTGlobal,
} from 'ads/slotControllers/googleAds/lib/adLifecycle';
import { ControllerNames } from '../types';
import {
  getApsPubId,
  getApsScriptUrl,
  getIndexExchangeScriptUrl,
  getRubiconScriptUrl,
  getTFCDAgeLimitApplies,
} from 'state/Ads/selectors';
import { getEmail } from 'state/Profile/selectors';
import { incrementVisitNum } from 'ads/shims/visitNum';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import type { AdsConfig } from 'ads/types';
import type { SlotDef } from 'ads/slotControllers/googleAds/useGoogleAdsPassThrough';
import type { SlotInstance } from 'ads/slotControllers/googleAds/types';

export const elementInViewport = (element: HTMLElement | null | undefined) => {
  if (!element) return false;

  const rect = element.getBoundingClientRect();

  return rect.bottom >= 0;
};

const useGoogleAdsSetup = (adsConfig: AdsConfig) => {
  const { isAdsEnabled, isPIIRestricted, enabledHeaderBidders, pageInfo } =
    adsConfig;

  // Increment our visit counter.
  // TODO: This is terrible.
  useEffect(() => {
    incrementVisitNum();
  }, []);

  // Set up our isReady state.
  const [isPubadsReady, setIsPubadsReady] = useState(false);
  const [isHeaderBiddingReady, setIsHeaderBiddingReady] = useState(false);
  const isAdsReady = useMemo(
    () => isPubadsReady && isHeaderBiddingReady,
    [isPubadsReady, isHeaderBiddingReady],
  );

  // definitions use both a ref and state so that we have fine control over which updates trigger
  // rerenders, but you should always read from slotDefinitions for info about slots
  // as that is guaranteed to be up to date.
  const onSlotsChanged = useCallback(
    (
      newSlots: Array<{
        slotId: string;
        slotDefChanged: boolean;
        slotDef: SlotDef;
        previousSlotDef: SlotDef;
        slotInstance: SlotInstance;
      }>,
    ) => {
      const slotsToRefresh = newSlots.reduce(
        (slots, currentSlot) => {
          const {
            slotId,
            slotDef,
            previousSlotDef = {} as SlotDef,
            slotInstance,
          } = currentSlot;
          const hasPreviousDef = !!Object.keys(previousSlotDef).length;

          if (
            hasPreviousDef &&
            !previousSlotDef.isActive &&
            slotDef.isActive &&
            elementInViewport(slotDef.el?.parentElement)
          ) {
            // eslint-disable-next-line no-param-reassign
            slots[slotId] = slotInstance;
          }
          return slots;
        },
        {} as { [k: string]: SlotInstance },
      );

      if (slotsToRefresh.length > 0) {
        logger.info(
          [CONTEXTS.ADS, ControllerNames.Google, 'refreshSlots'],
          slotsToRefresh,
        );
        refreshSlots(
          Object.keys(slotsToRefresh),
          Object.values(slotsToRefresh),
        );
      }
    },
    [],
  );
  const onSlotInactive = useCallback(
    (slotId: string, _slotDef: SlotDef, slotInstance: SlotInstance) => {
      clearSlot(slotId, slotInstance);
    },
    [],
  );
  const onSlotUnmount = useCallback(
    (
      slotId: string,
      slotDef: SlotDef,
      slotInstance: SlotInstance,
      slotElement: HTMLElement,
    ) => {
      resetSlot(slotId, slotDef, slotInstance, slotElement);
    },
    [],
  );
  const {
    slotDefinitions,
    slotInstances,
    slotElements,
    passSlotProps,
    slotInactive,
    unmountSlot,
    forceRerender,
  } = useSlotCollection({
    onSlotsChanged,
    onSlotInactive,
    onSlotUnmount,
  });

  const lastRouteKeyRef = useRef<string | null | undefined>(pageInfo.routeKey);

  const adUnit = useAdUnit();
  const lastAdUnitRef = useRef<string>(adUnit);

  // Get our values from state
  const gptScriptUrl = 'https://securepubads.g.doubleclick.net/tag/js/gpt.js';
  const rubiconScriptUrl = useSelector(getRubiconScriptUrl); // //micro.rubiconproject.com/prebid/dynamic/16442.js
  const apsPubId = useSelector(getApsPubId);
  const apsScriptUrl = useSelector(getApsScriptUrl);
  const indexExchangeScriptUrl = useSelector(getIndexExchangeScriptUrl);
  const liveRampScriptUrl = 'https://ats.rlcdn.com/ats.js';
  const userEmail = useSelector(getEmail);
  const fixedTargetingValues = useUserTargeting(adsConfig);
  const pageTargetingValues = usePageTargeting(adsConfig);
  const timeTargetingValues = useTimeTargeting(adsConfig);
  const playerTargetingValues = usePlayerTargeting();

  const TFCDApplies = useSelector(getTFCDAgeLimitApplies);
  // update GPT when TFCD age limit changes
  useEffect(() => {
    setChildDirectedTreament(TFCDApplies);
  }, [TFCDApplies]);

  const displayFlags = useGoogleAdsDisplayFlags(
    adsConfig,
    { slotDefinitions, slotInstances },
    isPubadsReady,
    forceRerender,
    adUnit,
    lastRouteKeyRef.current,
  );

  // Load GPT and and initial ad render
  useEffect(() => {
    if (
      (displayFlags.firstRenderReady || displayFlags.nextRenderReady) &&
      isHeaderBiddingReady
    ) {
      const prevInstances = slotInstances.current;
      logger.info(
        [CONTEXTS.ADS, ControllerNames.Google],
        `beginning refresh cycle (state in meta)`,
        {
          slotDefinitions: slotDefinitions.current,
          slotInstances: slotInstances.current,
          slotElements: slotElements.current,
          displayFlags,
        },
      );

      lastRouteKeyRef.current = pageInfo.routeKey || lastRouteKeyRef.current;

      if (displayFlags.firstRenderReady) {
        logger.info(
          [CONTEXTS.ADS, ControllerNames.Google],
          `loading gpt: ${gptScriptUrl}`,
        );
        gptPublisher.load(gptScriptUrl);
      }

      // define slots, target, and configure
      gptPublisher.enqueue(async ({ googleTag }) => {
        try {
          const {
            instances,
            elements,
            errors = {},
          } = initializeGPTSlots(
            googleTag,
            slotDefinitions,
            slotInstances,
            slotElements,
            lastAdUnitRef,
            adUnit,
            displayFlags,
          );

          Object.keys(errors).forEach(slotId => {
            // if there's an error setting up a slot, remove all of it's related state
            // so it can reregister and try again on the next ad render
            unmountSlot(slotId);
            slotDefinitions.get(slotId)?.onError?.(errors[slotId]);
          });

          slotInstances.overwrite(instances);
          slotElements.overwrite(elements);

          targetGPTGlobal(googleTag, {
            fixedTargetingValues,
            timeTargetingValues,
            pageTargetingValues,
            playerTargetingValues,
          });

          if (displayFlags.firstRenderReady) {
            await configureGPT(googleTag, { isPIIRestricted });
          }
        } catch (e) {
          // if we hit an error trying to render ads and it isn't caught by one of the catch blocks in adLifecycle
          // then clear all of our slots and call their error handling so we can start fresh.
          const error = e instanceof Error ? e : new Error(e as string);
          logger.error([CONTEXTS.ADS, ControllerNames.Google], error);
          slotDefinitions.map((slotDef, slotId) => {
            slotDef.onError?.(error);
            return unmountSlot(slotId);
          });
        }
      });

      // display slots
      gptPublisher.enqueue(async ({ googleTag }) => {
        try {
          await fetchAllHeaderBids(
            slotDefinitions,
            slotInstances,
            enabledHeaderBidders,
          );
          await displayGPTSlots(
            googleTag,
            slotDefinitions,
            slotInstances,
            slotElements,
            prevInstances,
            displayFlags,
          ).then(errorArr => {
            errorArr.forEach(({ error, slotId }) => {
              unmountSlot(slotId);
              slotDefinitions.get(slotId)?.onError?.(error);
            });

            if (displayFlags.firstRenderReady) {
              setIsPubadsReady(true);
            }
            logger.info(
              [CONTEXTS.ADS, ControllerNames.Google],
              'finished refresh cycle (state in meta)',
              {
                slotDefinitions: slotDefinitions.current,
                slotInstances: slotInstances.current,
                slotElements: slotElements.current,
              },
            );
          });
        } catch (e) {
          // if we hit an error trying to render ads and it isn't caught by one of the catch blocks in adLifecycle
          // then clear all of our slots and call their error handling so we can start fresh.
          const error = e instanceof Error ? e : new Error(e as string);
          logger.error([CONTEXTS.ADS, ControllerNames.Google], error);
          slotDefinitions.map((slotDef, slotId) => {
            slotDef.onError?.(error);
            return unmountSlot(slotId);
          });
        }
      });
    }
  }, [
    adUnit,
    isPIIRestricted,
    TFCDApplies,
    pageInfo,
    slotDefinitions,
    setIsPubadsReady,
    unmountSlot,
    isHeaderBiddingReady,
    displayFlags.firstRenderReady,
    displayFlags.nextRenderReady,
    displayFlags.pageChanged,
    displayFlags.slotsNeedInstantiation,
    displayFlags.forceRerender,
    displayFlags.windowBecameActive,
  ]);

  // Load header bidding
  useEffect(() => {
    if (isAdsEnabled) {
      loadHeaderBidders(
        enabledHeaderBidders,
        {
          rubiconScriptUrl,
          apsScriptUrl,
          apsPubId,
          indexExchangeScriptUrl,
          liveRampScriptUrl,
        },
        userEmail,
      ).finally(() => {
        setIsHeaderBiddingReady(true);
      });
    }
  }, [
    isAdsEnabled,
    enabledHeaderBidders.amazon,
    enabledHeaderBidders.rubicon,
    enabledHeaderBidders.indexExchange,
    enabledHeaderBidders.liveRamp,
  ]);

  // Return true when everything is ready.
  return { isAdsReady, passSlotProps, slotInactive, unmountSlot };
};

export default useGoogleAdsSetup;
