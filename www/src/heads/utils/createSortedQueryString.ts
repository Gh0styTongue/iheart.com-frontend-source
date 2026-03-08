/**
 * Creates a query string from an object that is sorted alphabetically.
 */

import qs from 'qs';

type QueryObject = Parameters<(typeof qs)['stringify']>[0];

const sortObject = (obj: QueryObject) =>
  Object.keys(obj)
    .sort()
    .reduce((sortedObj, key) => ({ ...sortedObj, [key]: obj[key] }), {});

const createSortedQueryString = (queryObject: QueryObject): string =>
  qs.stringify(sortObject(queryObject));

export default createSortedQueryString;
