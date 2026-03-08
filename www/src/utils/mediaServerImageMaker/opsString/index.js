import {
  anchor as baseAnchor,
  appendOps as baseAppendOps,
  blur as baseBlur,
  contain as baseContain,
  cover as baseCover,
  fit as baseFit,
  gravity as baseGravity,
  max as baseMax,
  maxcontain as baseMaxcontain,
  prependOps as basePrependOps,
  quality as baseQuality,
  ratio as baseRatio,
  resize as baseResize,
  run as baseRun,
  tile as baseTile,
  urlOps as baseUrlOps,
  buildOpsString,
  doubleXYIfRetina,
  urlHasOp,
} from './opsString';
import { curry } from 'lodash-es';

export const anchor = curry(doubleXYIfRetina(baseAnchor));
export const appendOps = curry(baseAppendOps);
export const blur = curry(baseBlur);
export const contain = curry(doubleXYIfRetina(baseContain));
export const cover = curry(doubleXYIfRetina(baseCover));
export const fit = curry(doubleXYIfRetina(baseFit));
export const max = curry(doubleXYIfRetina(baseMax));
export const maxcontain = curry(doubleXYIfRetina(baseMaxcontain));
export const prependOps = curry(basePrependOps);
export const quality = curry(baseQuality);
export const ratio = curry(baseRatio);
export const resize = curry(doubleXYIfRetina(baseResize));
export const run = curry(baseRun);
export const tile = curry(baseTile);
export const urlOps = curry(baseUrlOps);
export const gravity = curry(baseGravity);
export { buildOpsString, urlHasOp };
