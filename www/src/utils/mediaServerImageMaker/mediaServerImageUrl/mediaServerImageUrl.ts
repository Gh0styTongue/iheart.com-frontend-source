import base64 from 'base-64';
import defaultUrlParse from '../URL';
import URLParse, { URLPart } from 'url-parse';
import { curry, flow, omit } from 'lodash-es';
import { MEDIA_SERVER_DOMAINS } from './constants';

export function decodeUrl(urlObj: URLParse) {
  return urlObj.set('pathname', decodeURIComponent(urlObj.pathname));
}

export function isMediaServerDomain(parsedUrl: URLParse) {
  return MEDIA_SERVER_DOMAINS.includes(parsedUrl.hostname);
}

export function copyUrl(urlObj: URLParse) {
  return defaultUrlParse(urlObj.toString());
}

export function copyProps(
  urlObj: URLParse,
  props: Partial<Pick<URLParse, URLPart>> = {},
) {
  const newCopy = copyUrl(urlObj);
  (Object.keys(props) as Array<URLPart>).forEach(prop => {
    newCopy.set(prop, props[prop]);
  });
  return newCopy;
}

export function makeHttps(urlObj: URLParse) {
  return copyProps(urlObj, {
    protocol: 'https:',
    slashes: true,
  });
}

export function baseEncodeMediaServerSecureUrl(
  mediaServerUrl: string,
  urlObj: URLParse,
) {
  let url;
  if (!isMediaServerDomain(urlObj)) {
    const b64url = base64.encode(encodeURIComponent(urlObj.toString()));
    // the actual encoding isn't actually base 64, so we pull out a few chars before returning.
    const encodedUrl = b64url.replace('+', '-').replace('/', '_');
    url = defaultUrlParse(`${mediaServerUrl}/v3/url/${encodedUrl}`);
  } else {
    url = urlObj;
  }

  return makeHttps(url);
}
export const encodeMediaServerSecureUrl = curry(baseEncodeMediaServerSecureUrl);

export function baseMakeAbsolute(siteUrl: string, urlObj: URLParse) {
  if (!urlObj.host) return copyProps(urlObj, { host: siteUrl });

  return urlObj;
}
export const makeAbsolute = curry(baseMakeAbsolute);

export function addQuery(query: Record<string, string>, urlObj: URLParse) {
  const originalQuery = urlObj.query;
  return copyProps(urlObj, { query: { ...originalQuery, ...query } });
}

export function addOps(ops: string, urlObj: URLParse) {
  return addQuery({ ops }, urlObj);
}

export function buildImageUrl(
  ...fns: Array<any>
): (config?: URLParse | string) => string {
  return (config = {} as URLParse) =>
    flow(...fns)(
      typeof config === 'string' ? defaultUrlParse(config) : config,
    ).toString();
}

function assetUrlCheck(urlObj: URLParse) {
  const assetServerHrefCheck = /^asset:\/\//;
  if (assetServerHrefCheck.test(urlObj.href)) {
    return defaultUrlParse(
      `https://i.iheart.com/v3/re/${urlObj.href.substring(8)}`,
    );
  }
  return urlObj;
}

export function buildUrl(
  { mediaServerUrl, siteUrl }: { mediaServerUrl: string; siteUrl: string },
  url: string,
  requestObject: URLParse,
) {
  if (!url) return requestObject;
  const imageUrl = buildImageUrl(
    assetUrlCheck,
    makeAbsolute(siteUrl),
    decodeUrl,
    encodeMediaServerSecureUrl(mediaServerUrl),
  )(defaultUrlParse(url));

  return copyProps(defaultUrlParse(imageUrl), requestObject);
}

export function buildCatalogUrl(
  mediaServerUrl: string,
  { resourceType, id }: { resourceType: string; id: string | number },
  requestObject: URLParse,
) {
  const url = defaultUrlParse(
    `${mediaServerUrl}/v3/catalog/${resourceType}/${id}`,
  );
  return copyProps(makeHttps(url), requestObject);
}

export function buildCatalogMetaUrl(
  mediaServerUrl: string,
  { resourceType, id }: { resourceType: string; id: string | number },
  requestObject: URLParse,
) {
  const url = defaultUrlParse(
    `${mediaServerUrl}/v3/catalog/${resourceType}/${id}`,
  );
  return copyProps(makeHttps(url), requestObject);
}

export function buildUserUrl(
  mediaServerUrl: string,
  profileId: number,
  requestObject: URLParse,
) {
  const url = defaultUrlParse(`${mediaServerUrl}/v3/user/${profileId}/profile`);

  return copyProps(makeHttps(url), requestObject);
}

export function buildAssetUrl(
  mediaServerUrl: string,
  bucket: string,
  id: string | number,
  requestObject: URLParse,
) {
  const url = defaultUrlParse(`${mediaServerUrl}/v3/re/${bucket}/${id}`);

  return copyProps(makeHttps(url), requestObject);
}

export function urlHasParam(url: string, paramName: string) {
  return Object.prototype.hasOwnProperty.call(
    defaultUrlParse(url).query,
    paramName,
  );
}

export function removeParam(paramName: string, urlObj: URLParse) {
  const originalQuery = urlObj.query;
  return copyProps(urlObj, { query: omit(originalQuery, [paramName]) });
}
