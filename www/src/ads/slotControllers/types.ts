import { VisHandlers } from './googleAds/useGoogleAdsPassThrough';
import type {
  AdSlotContainerInfo,
  AdUnit,
  EnabledHeaderBidders,
  TargetingValues,
} from 'ads/types';

export type AdSlotControllerName =
  | 'none'
  | 'googleAds'
  | 'liveAdswizzAds'
  | 'liveTritonAds'
  | 'customAds';

/**
 * A controller to imperatively control a particular ad type within an ad slot container.
 */
export type AdSlotControllerInstance = {
  /**
   * The static name of our controller.
   */
  name: AdSlotControllerName;

  /**
   * Attach our slot configuration.
   */
  initialize: (adSlotContainerInfo: AdSlotContainerInfo) => void;

  /**
   * Value is only applied after a new load() call, during which a new slot instance is created.
   */
  setAdUnit?: (adUnit: AdUnit) => void;

  /**
   * Value is only applied after a refresh() call.
   */
  setTargeting?: (targetingValues: TargetingValues) => void;

  /**
   * Enable or disable header bidders.
   */
  setEnabledHeaderBidders?: (
    enabledHeaderBidders: EnabledHeaderBidders,
  ) => void;

  /**
   * Called once to instantiate, again to rebuild with a new ad unit or new targeting.
   */
  refresh: (visHandlers?: VisHandlers) => Promise<void>;

  /**
   * Tell GPT we are temporarily not displaying this slot.
   */
  clear?: () => Promise<void>;

  /**
   * Permanently destroy this slot.
   */
  destroy: () => Promise<void>;
};

export enum ControllerNames {
  Custom = 'customAds',
  Google = 'googleAds',
  LiveAdswizz = 'liveAdswizzAds',
  LiveTriton = 'liveTritonAds',
  None = 'none',
}
