import * as React from 'react';
import AdsContext from 'ads/components/AdsProvider/AdsContext';
import useCCPAOpt from 'ads/shims/useCCPAOptOut';
import useGoogleAdsSetup from 'ads/slotControllers/googleAds/useGoogleAdsSetup';
import {
  adFreeSelector,
  noPrerollSelector,
} from 'state/Entitlements/selectors';
import { getAdsSuppressed } from 'state/Ads/selectors';
import { getCurrentCountry } from 'state/Location/selectors';
import { getIsAdBlocked } from 'state/UI/selectors';
import { getPageInfo } from 'state/Routing/selectors';
import { useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import type {
  AdsConfig,
  AdsContext as AdsContextValue,
  EnabledHeaderBidders,
} from 'ads/types';

type Props = {
  children: React.ReactNode;
};

/**
 * The entry point for our ads ecosystem.
 */
const AdsProvider: React.FC<Props> = ({ children }) => {
  // Determine if we should show display ads
  const adsFreeEntitlement = useSelector(adFreeSelector);
  const noPreroll = useSelector(noPrerollSelector);
  const adsSuppressedForBot = useSelector(getAdsSuppressed);
  const isAdBlocked = useSelector(getIsAdBlocked);
  const isAdsEnabled = !(
    adsFreeEntitlement ||
    noPreroll ||
    adsSuppressedForBot ||
    isAdBlocked
  );
  const isPIIRestricted = useCCPAOpt();
  const currentCountry = useSelector(getCurrentCountry);

  // Get our page and station info.
  // TODO: Access this directly in child hooks once it becomes a provider.
  const pageInfo = useSelector(getPageInfo);

  const [enabledHeaderBidders] = useState<EnabledHeaderBidders>({
    // TODO: Also make sure they don't try and execute!
    amazon: !isPIIRestricted && currentCountry === 'US',
    indexExchange: !isPIIRestricted && currentCountry !== 'US',
    rubicon: !isPIIRestricted && currentCountry === 'US',
    liveRamp: !isPIIRestricted && currentCountry === 'US',
  });

  // Build our global ads configuration.
  const adsConfig = useMemo<AdsConfig>(
    () => ({
      isAdsEnabled,
      isPIIRestricted,
      enabledHeaderBidders,
      pageInfo,
    }),
    // TODO: Improper memoization. This is why we need to abstract these into separate providers.
    [isAdsEnabled, isPIIRestricted, pageInfo, enabledHeaderBidders],
  );

  // Load our scripts and setup ad slots.
  const { isAdsReady, passSlotProps, slotInactive, unmountSlot } =
    useGoogleAdsSetup(adsConfig);

  // Create our provider value.
  const adsProviderValue = useMemo<AdsContextValue>(
    () => ({
      isAdsEnabled,
      adsConfig,
      providerLoaded: true,
      isAdsReady,
      google: {
        passSlotProps,
        slotInactive,
        unmountSlot,
      },
    }),
    [
      adsConfig,
      isAdsReady,
      isAdsEnabled,
      passSlotProps,
      slotInactive,
      unmountSlot,
    ],
  );

  // Return a provider that can be consumed downstream by our ads components.
  return (
    <AdsContext.Provider value={adsProviderValue}>
      {children}
    </AdsContext.Provider>
  );
};

export default AdsProvider;
