import qs from 'qs';
import url from 'url';

export default function buildQuery(queries = {}, opts = {}) {
  const queryString = qs.stringify(queries, opts);
  return queryString ? `?${queryString}` : '';
}

export function paginationQS(limit: number, pageKey: string) {
  return buildQuery({ limit, pageKey }, { skipNulls: true });
}

export function extractQSAsObject(initialUrl = '') {
  const queryString = url.parse(initialUrl).query || '';
  return qs.parse(queryString);
}
