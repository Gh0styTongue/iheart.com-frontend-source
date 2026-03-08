import factory from 'state/factory';
import { adsFreeCustomSelector } from 'state/Entitlements/selectors';
import { getCustomAdsEnabled, getCustomAdsType } from 'state/Ads/selectors';
import type { CustomAdTypes } from './constants';
import type { CustomInStreamAdMethods } from './types';

const store = factory();

const initialize: CustomInStreamAdMethods['initialize'] =
  ({ getState, setState }) =>
  async () => {
    if (getState().isInitialized) return;

    const state = store.getState();
    const adsFreeEntitlement = adsFreeCustomSelector(state);
    const customAdsEnabled = getCustomAdsEnabled(state);
    const customAdsType = getCustomAdsType(state) as CustomAdTypes;

    // Supress ads if:
    // - User is "all access" (no ads entitlement)
    // - Custom ads has been disabled via location config
    const isEnabled = !adsFreeEntitlement && customAdsEnabled;

    if (!isEnabled || !customAdsType) {
      setState({
        customAdsType: null,
        isEnabled: false,
        isInitialized: true,
      });
      return;
    }

    setState({
      isInitialized: true,
      isEnabled: true,
      customAdsType,
    });
  };

export default initialize;
