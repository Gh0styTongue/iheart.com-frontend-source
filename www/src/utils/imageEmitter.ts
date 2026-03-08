import { createEmitter } from './createEmitter';

// Create an Emitter to hook into the ProxyImage `set` calls
export const ImageEmitter = createEmitter({
  set(property: PropertyKey, value: any) {
    return {
      property,
      value,
    };
  },
});
