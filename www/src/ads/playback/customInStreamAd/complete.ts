import factory from 'state/factory';
import { customCompanion } from 'state/Ads/actions';
import { customInstreamEmitter } from 'ads/shims/CustomInStreamAd';
import type { CustomInStreamAdMethods } from './types';

const store = factory();

/**
 * After a custom in-stream ad completes,
 * it's time to tell our app that we can preload another one
 */
const complete: CustomInStreamAdMethods['complete'] = () => async () => {
  store.dispatch(customCompanion(null));
  customInstreamEmitter.complete();
};

export default complete;
