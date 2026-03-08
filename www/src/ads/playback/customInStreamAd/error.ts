import { customInstreamEmitter } from 'ads/shims/CustomInStreamAd';
import type { CustomInStreamAdMethods } from './types';

/**
 * If Triton/Adswizz did not prepare an ad, we will get a jw adError as the
 * vast document will be empty. We use that as an opportunity to signal that
 * we are ready to preload the next one.
 */
const error: CustomInStreamAdMethods['error'] = () => async () => {
  customInstreamEmitter.complete();
};

export default error;
