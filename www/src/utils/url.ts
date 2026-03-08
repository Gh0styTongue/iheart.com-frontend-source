// # utils.url
// Handle parsing & various URL manipulation operations
/**
 * @module utils/url
 */
import { isPlainObject } from 'lodash-es';
import { slugify } from 'utils/string';

const HTTP_REGEX = /^http(s?):\/\/.*?\//g;

/**
 * Get query params as a map
 * We should deprecate this function in favor of qs.parse.
 *
 * @param  {String} url URL string to parse
 * @return {Object}     Map of query params
 */
export function query(url?: string) {
  const map: Record<string, string | Array<string>> = {};
  let pair;

  if (!url && !__CLIENT__) {
    return {};
  }

  const [, q] = (url ?? window.location.href).split('?');

  if (!q) {
    return map;
  }

  const vars = q.split('&');

  Object.keys(vars).forEach(k => {
    // Object.keys returns an array of strings
    // Since we're calling Object.keys on an array,
    // all of those strings will be stringified numbers
    pair = vars[k as any as number].split('=');
    if (typeof map[pair[0]] === 'undefined') {
      // If key's not there, save it
      map[pair[0]] = pair[1]; // eslint-disable-line
    } else if (typeof map[pair[0]] === 'string') {
      // If already exist, change to an array and push it at the end
      map[pair[0]] = [map[pair[0]] as string, pair[1]];
    } else {
      (map[pair[0]] as Array<string>).push(pair[1]);
    }
  });

  return map;
}

/**
 * Similar to $.param, convert an object to URL-encoded mapping string
 * @param  {Object} obj Object to convert
 * @param  {String} delim Delimiter (optional, default to &)
 * @return {String}     String of key1=value1&key2=value2
 */
export function param(obj: Record<string, string | number>, delim?: string) {
  if (!isPlainObject(obj)) return '';
  const queries: Array<string> = [];
  Object.keys(obj).forEach(k => {
    if (obj[k] !== undefined) {
      queries.push(
        `${encodeURIComponent(k)}=${encodeURIComponent(obj[k] as string)}`,
      );
    }
  });
  return queries.join(delim || '&');
}

/**
 * Add more params to a path
 * @param {String} path   Path to add params to
 * @param {Object} params Extra params in the form of an object
 * @return {String} Path w/ additional params
 */
export function addParams(
  path: string,
  params: Record<string, string | number>,
) {
  if (!isPlainObject(params) || !Object.keys(params).length) {
    return path;
  }
  return params ?
      path + (path.split('?')[1] ? '&' : '?') + param(params)
    : path;
}

/**
 * Gets path w/ querystring, and strips the '#/' stuff that IE uses in place of pushState.
 * @example
 * getRelativePath('http://foo.com/bar'); // '/bar'
 * getRelativePath('http://foo.com/#bar'); // '/bar'
 * getRelativePath('http://foo.com/#/bar'); // '/bar'
 * getRelativePath('http://foo.com/bar?test=1'); // '/bar?test=1'
 * @param  {String} path Path to be converted
 * @return {String}      Relative path out of the full `path`
 */
export function getRelativePath(url: string) {
  let path = url;

  if (!path && __CLIENT__) path = window.location.href;
  if (typeof path !== 'string') return '';

  return path.replace(HTTP_REGEX, '/').replace('/#/', '/').replace('/#', '/');
}
/**
 * Join a `host` & a `path` together, also takes care of `//`.
 * @example
 * join('http://test.com/', '/bar'); // 'http://test.com/bar'
 * @param  {String} host Host
 * @param  {String} path relative path
 * @return {String}      Full URL
 */
export function join(host: string, path: string) {
  return (host + getRelativePath(path)).replace(/([^:])\/\//g, '$1/');
}

/**
 * Get scaled image via iscale
 * @param  {Number} id     Catalog Id
 * @param  {String} type   Catalog Type
 * @param  {Number} w      width
 * @param  {Number} h      height
 * @param  {String} method scale method
 * @param  {Object} opts   Options
 * @param  {String} opts.__host Override iscale host (default to iscale.iheart.com)
 * @return {String} Scaled image URL
 */
export function getScaledImageUrlById(
  id: number | string,
  catalogType: string,
  w?: number,
  h?: number,
  method = 'fit',
  opts: { [key: string]: string } = {},
) {
  if (!catalogType || !id) return '';

  const { __host: host = 'https://iscale.iheart.com', ...params } = opts;

  let type = catalogType;
  // iscale supports show, not podcast
  if (type === 'podcast') type = 'show';
  else if (type === 'original') type = 'featured';

  const url = `${host}/catalog/${type}/${id}`;

  // No width & height? just return the URL
  if (w || h) params.ops = `${method}(${w || h},${h || w})`;

  return addParams(url, params);
}

/**
 * Get a relative slugified path to an artist
 * @param  {Number} artistId   Artist ID
 * @param  {String} artistName Artist Name
 * @return {String}            Relative path to artist
 */
export function getArtistUrl(artistId: number, artistName: string) {
  if (!artistId) {
    return null;
  }
  return `/artist/${slugify(artistName)}-${artistId}/`;
}
/**
 * Get a relative slugified path to an album
 * @param  {Number} artistId
 * @param  {String=} artistName
 * @param  {Number} albumId
 * @param  {String} albumName
 * @return {String}
 */
export function getAlbumUrl(
  artistId: number,
  artistName: string,
  albumId: number,
  albumName: string,
) {
  if (!artistId || !albumId) {
    return null;
  }
  return `/artist/${slugify(artistName)}-${artistId}/albums/${slugify(
    albumName,
  )}-${albumId}/`;
}
/**
 * Get a relative slugified path to a song
 * @param  {Number} artistId   Artist ID
 * @param  {String=} artistName Artist name
 * @param  {Number} trackId    Track ID
 * @param  {String=} trackName  Track Name
 * @return {String}            Relative path
 */
export function getTrackUrl(
  artistId: number,
  artistName: string,
  trackId: number,
  trackName: string,
) {
  if (!artistId || !trackId) {
    return null;
  }
  return `/artist/${slugify(artistName)}-${artistId}/songs/${slugify(
    trackName,
  )}-${trackId}/`;
}
/**
 * Get a relative slugified path to a featured station
 * @param  {String} idOrSlug Station ID or Slug
 * @return {String}          Relative path
 */
export function getFeaturedUrl(idOrSlug?: string) {
  if (!idOrSlug) {
    return null;
  }
  return `/original/${idOrSlug}/`;
}
/**
 * Get a relative slugified path to a live station
 * param  {Number} id   Live station ID
 * param  {String} name Station name
 * return {String}      Relative path
 */
export function getLiveUrl(
  id: number | string | undefined,
  name: string | undefined,
) {
  if (!id) {
    return null;
  }
  return `/live/${slugify(name || '')}-${id}/`;
}
/**
 * Get a relative slugified path to a favorites radio station
 */
export function getFavoritesRadioUrl(slug: string) {
  if (!slug) {
    return null;
  }
  return `/favorites/${slug}/`;
}
/**
 * Get a relative slugified path to a genre profile
 * @param  {Number} id   Genre ID
 * @param  {String} name Genre name
 * @return {String}      Relative path
 */
export function getGenreUrl(id: number | string, name: string) {
  if (!id) {
    return null;
  }
  return `/genre/${slugify(name || '')}-${id}/`;
}

/**
 * Resolves urls which are possibly relative. The primary use-case
 * is for handling external_urls returned by articles, as these can be relative links,
 * but should actually navigate to the station's site
 * @param {string} url A possibly relative url to resolve
 * @param {string} baseUrl A baseUrl to prepend the url in the case that it is relative
 * @return {string} the resolved url
 */
export function resolvePossiblyRelativeUrl(
  url: string,
  baseUrl: string,
): string | null {
  // First try to create a URL instance with just the possibly relative url
  try {
    return new URL(url).href;
  } catch {
    // If we caught an error, the url was relative and we need to provide a baseUrl
    try {
      const baseWithProtocol =
        baseUrl.startsWith('http') ? baseUrl : `https://${baseUrl}`;
      return new URL(url, baseWithProtocol).href;
    } catch {
      // If all else fails, return null rather than throwing an error.
      return null;
    }
  }
}
