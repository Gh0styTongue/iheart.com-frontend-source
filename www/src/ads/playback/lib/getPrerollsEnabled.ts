import factory from 'state/factory';
import { getAdsSuppressed } from 'state/Ads/selectors';
import { noPrerollSelector } from 'state/Entitlements/selectors';

const store = factory();

const getPrerollsEnabled = async (): Promise<boolean> => {
  const state = store.getState();

  const isPrerollFree = noPrerollSelector(state);
  const isAdSuppressed = getAdsSuppressed(state);

  return !(isPrerollFree || isAdSuppressed);
};

export default getPrerollsEnabled;
