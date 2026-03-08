import {
  addOps as baseAddOps,
  addQuery as baseAddQuery,
  buildAssetUrl as baseBuildAssetUrl,
  buildCatalogMetaUrl as baseBuildCatalogMetaUrl,
  buildCatalogUrl as baseBuildCatalogUrl,
  buildUrl as baseBuildUrl,
  buildUserUrl as baseBuildUserUrl,
  removeParam as baseRemoveParam,
  buildImageUrl,
  decodeUrl,
  encodeMediaServerSecureUrl,
  makeAbsolute,
  makeHttps,
  urlHasParam,
} from './mediaServerImageUrl';
import { curry } from 'lodash-es';

const addQuery = curry(baseAddQuery);
const addOps = curry(baseAddOps);
const buildUrl = curry(baseBuildUrl);
const buildCatalogMetaUrl = curry(baseBuildCatalogMetaUrl);
const buildCatalogUrl = curry(baseBuildCatalogUrl);
const buildUserUrl = curry(baseBuildUserUrl);
const buildAssetUrl = curry(baseBuildAssetUrl);
const removeParam = curry(baseRemoveParam);

export {
  buildImageUrl,
  decodeUrl,
  encodeMediaServerSecureUrl,
  makeAbsolute,
  addQuery,
  addOps,
  buildUrl,
  buildCatalogUrl,
  buildCatalogMetaUrl,
  buildUserUrl,
  buildAssetUrl,
  removeParam,
  urlHasParam,
  makeHttps,
};
