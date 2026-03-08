import cookie from 'js-cookie';
import localStorage from 'utils/localStorage';
import { v4 as uuid } from 'uuid';

export function getActiveSessionFromCookies() {
  const profileId = cookie.get('pid');
  const sessionId = cookie.get('aid');
  const anonId = cookie.get('auuid');
  const deviceId = cookie.get('deviceId');

  return {
    anonId: anonId || uuid(),
    deviceId: [undefined, 'undefined'].includes(deviceId) ? uuid() : deviceId,
    isAnonymous: !!anonId || !profileId,
    profileId,
    sessionId,
  };
}

export function clearUserCookies() {
  localStorage.removeItem('_loc_ids');
  localStorage.removeItem('ihr-favorites-name');
  localStorage.removeItem('ihr-favorites-id');
  localStorage.removeItem('ihr-myplaylist-visited');
  localStorage.removeItem('ihr-player-state');
  localStorage.removeItem('tritonSecureTokenExpiration');
  localStorage.removeItem('tritonSecureToken');
}

export function queueRefresh(address = '/', timeout = 0) {
  setTimeout(() => {
    window.location.href = address;
  }, timeout);
}
