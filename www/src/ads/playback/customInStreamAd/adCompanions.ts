import factory from 'state/factory';
import { customCompanion } from 'state/Ads/actions';
import type { CustomInStreamAdMethods } from './types';

const store = factory();

/**
 * A custom in-stream ad with a companion will fire this method when it begins playing.
 */
const adCompanions: CustomInStreamAdMethods['adCompanions'] =
  () => async data => {
    store.dispatch(customCompanion(data?.companions?.[0]));
  };

export default adCompanions;
