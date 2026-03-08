import { extractQSAsObject } from 'utils/queryStrings';
import { flow } from 'lodash-es';

export function buildOpsString(...fns) {
  return (initialOps = '') => flow(...fns)(initialOps);
}

export function buildOp(opName, ...opValues) {
  return `${opName}(${opValues.join(',')})`;
}

export function trimOps(ops) {
  // this gets us around any issues with an op function returning an empty string and still being appended.
  return ops
    .replace(/(\s+)/g, '') // remove whitespace
    .replace(/^(,)/g, '') // remove leading comma
    .replace(/(,)$/g, '') // remove trailing comma
    .replace(/(,+)/g, ','); // remove any duplicate commas
}

export function appendOps(newOps, opsString) {
  return trimOps(`${opsString}, ${newOps}`);
}

export function prependOps(fn, opsString) {
  const newOps = fn('');
  return appendOps(opsString, newOps);
}

export function extractOpsFromUrl(url) {
  return extractQSAsObject(url).ops || '';
}

export function urlOps(url, opsString) {
  const ops = extractOpsFromUrl(url);
  return appendOps(ops, opsString);
}

// Setting this function to always double the resolution, as NOT having it doubled breaks some
// additional processing downstream - the simplest fix was to have this function always treat the
// resolution as if it is retina [IHRWEB-18268](https://ihm-it.atlassian.net/browse/IHRWEB-18268)
export function doubleXYIfRetina(func) {
  return (x, y, opsString) => {
    const doubleResolution = true;
    const dimensions = doubleResolution ? [x * 2, y * 2] : [x, y];
    return func(...dimensions, opsString);
  };
}

export function fit(width, height, opsString) {
  return appendOps(buildOp('fit', width, height), opsString);
}

export function run(option, opsString) {
  return appendOps(buildOp('run', `"${option}"`), opsString);
}

export function anchor(x, y, opsString) {
  return appendOps(buildOp('anchor', x, y), opsString);
}

export function ratio(width, height, opsString) {
  return appendOps(buildOp('ratio', width, height), opsString);
}

export function resize(width, height, opsString) {
  return appendOps(buildOp('resize', width, height), opsString);
}

export function blur(blurLevel, opsString) {
  return appendOps(buildOp('blur', blurLevel), opsString);
}

export function gravity(gravityType, opsString) {
  return appendOps(buildOp('gravity', `"${gravityType}"`), opsString);
}

export function tile(rows, opsString) {
  return appendOps(buildOp('tile', rows, rows), opsString);
}

export function contain(width, height, opsString) {
  return appendOps(buildOp('contain', width, height), opsString);
}

export function cover(width, height, opsString) {
  return appendOps(buildOp('cover', width, height), opsString);
}

export function max(width, height, opsString) {
  return appendOps(buildOp('max', width, height), opsString);
}

export function maxcontain(width, height, opsString) {
  return appendOps(buildOp('maxcontain', width, height), opsString);
}

export function quality(qualityLevel, opsString) {
  return appendOps(buildOp('quality', qualityLevel), opsString);
}

export function urlHasOp(url, opName) {
  const ops = extractOpsFromUrl(url);
  return !!ops.match(new RegExp(`${opName}\\(.*?\\)`));
}
