import hub, { E } from 'shared/utils/Hub';
import localStorage from 'utils/localStorage';
import reduxFactory from 'state/factory';
import { getIsLoggedOut } from 'state/Session/selectors';
import { getIsMobile } from 'state/Environment/selectors';
import { getStationType as getPlaylistStationType } from 'state/Playlist/selectors';
import { isPlaylist } from 'state/Playlist/helpers';
import { memoize } from 'lodash-es';

const KEY = 'al-action';
const store = reduxFactory();

function AuthLoad() {
  this._savedCall = null;

  hub.on(E.AUTH_LOAD_HANDLE, (method, ...args) => {
    this._savedCall = {
      args,
      handler: method,
    };
    this._save();
  });
}

AuthLoad.prototype._save = function _save() {
  localStorage.setItem(KEY, this._savedCall);
};

AuthLoad.prototype.handlers = {
  createRadio(type, seedId, playedFrom, options) {
    // mobile devices won't allow us to do this.
    if (getIsMobile(store.getState())) return false;
    if (isPlaylist(type)) {
      // AV - WEB-12533 - 11/1/18
      // if an anon user tries to play a specific track, the type that goes in here will be "playlistradio"
      // if they log in as an AA user the type that should be passed to createRadio should actually be "collection"
      // they might be signing in as a free user though so we select against the playlist in case playlistradio was correct
      hub.trigger(
        E.CREATE_RADIO,
        getPlaylistStationType(store.getState(), { seedId }),
        seedId,
        playedFrom,
        options,
      );
    } else {
      hub.trigger(E.CREATE_RADIO, type, seedId, playedFrom, options);
    }
    return 'createRadio';
  },
};

/**
 * Remove the method being queued, only if it is queued
 * @param  {String} method Method name
 */
AuthLoad.prototype.remove = function remove(method) {
  if (this._savedCall && method === this._savedCall.handler)
    localStorage.removeItem(KEY);
};

/**
 * Load the action queued for authentication
 * @return {String} handler fn name that was executed
 */
AuthLoad.prototype.load = function load() {
  if (getIsLoggedOut(store.getState())) {
    return undefined;
  }

  const action = localStorage.getItem(KEY);

  // Flush it
  localStorage.removeItem(KEY);

  if (action && this.handlers[action.handler]) {
    return this.handlers[action.handler].apply(null, action.args);
  }

  return undefined;
};

export const getInstance = memoize(() => new AuthLoad());
