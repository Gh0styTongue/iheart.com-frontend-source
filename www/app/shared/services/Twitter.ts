/* eslint-disable camelcase, no-underscore-dangle */

/**
 * @module social/twitter
 */

import { join, param } from 'utils/url';

const domain =
  __CLIENT__ ? `${window.location.protocol}//${window.location.host}/` : '/';

function _getShareUrl(text: string, url: string, screenName = '') {
  return `http://x.com/share?${param({
    related: 'iHeartRadio',
    screen_name: screenName,
    text,
    url: join(domain, url),
  })}`;
}

/**
 * Get sharing URL
 * @function getShareUrl
 * @static
 * @param  {String} url  URL to be shared
 * @param  {String} name Name of item being shared
 * @return {String}      Sharing URL
 */
export function getShareUrl(url: string, name: string) {
  return _getShareUrl(`I’m listening to ${name} \u266B @iHeartRadio`, url);
}
/**
 * Get Tweet URL
 * @function getTweetUrl
 * @static
 * @param  {String} username Station username
 * @return {String}          Tweet URL
 */
export function getTweetUrl(username: string) {
  if (!username) return '';
  return _getShareUrl('', '', username.replace(/@/g, '').trim());
}
