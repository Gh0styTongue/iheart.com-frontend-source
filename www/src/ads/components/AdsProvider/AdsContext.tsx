import { AdsContext as AdsContextType } from 'ads/types';
import { createContext } from 'react';
import { DEFAULT_PAGE_INFO } from 'ads/targeting/constants';

export const DEFAULT_CONTEXT_VALUE = {
  isAdsEnabled: false,
  isAdsReady: false,
  providerLoaded: false,
  adsConfig: {
    isPIIRestricted: false,
    isAdsEnabled: false,
    pageInfo: { ...DEFAULT_PAGE_INFO },
    enabledHeaderBidders: {
      amazon: false,
      indexExchange: false,
      rubicon: false,
    },
  },
  google: {
    passSlotProps: () => {},
    unmountSlot: () => {},
    slotInactive: () => {},
  },
} as const;

const AdsContext = createContext<AdsContextType>(DEFAULT_CONTEXT_VALUE);

export default AdsContext;
