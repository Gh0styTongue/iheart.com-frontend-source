/* eslint-disable */

// # utils.Hub
// Essentially a event emitter where you can subscribe to certain events with their respective handlers.
// Adapted from [Backbone Events](http://backbonejs.org/)
/**
 * @module utils
 */

import logger, { CONTEXTS } from 'modules/Logger';
import { once as listenOnce } from 'lodash-es';

const _slice = Array.prototype.slice;

let hub; // eslint-disable-line import/no-mutable-exports

if (__CLIENT__) {
  /**
   * Initialize the hub
   * @constructor
   */
  function Hub() {
    const self = this;
    this.handlers = {};
    Object.keys(props).forEach(k => {
      self[k] = self[k].bind(self);
    });
  }

  const props = Hub.prototype;

  Hub.prototype = {
    // ### Private functions
    /**
     * Handle space delimited names to do multiple bindings.
     * @private
     */
    _eventsApi(obj, action, name, rest) {
      if (!name) return true;

      const eventSplitter = /\s+/;
      // Handle event maps.
      if (typeof name === 'object') {
        for (const key in name) {
          obj[action](...[key, name[key]].concat(rest));
        }
        return false;
      }

      // Handle space separated event names.
      if (eventSplitter.test(name)) {
        const names = name.split(eventSplitter);
        for (let i = 0, l = names.length; i < l; i++) {
          obj[action](...[names[i]].concat(rest));
        }
        return false;
      }

      return true;
    },
    /**
     * Optimized internal dispatch function for triggering events.
     * @private
     */
    _triggerEvents(events, args) {
      let ev;
      let i = -1;
      const l = events.length;
      const a1 = args[0];
      const a2 = args[1];
      const a3 = args[2];
      switch (args.length) {
        case 0:
          while (++i < l) (ev = events[i]).callback.call(ev.ctx);
          return;
        case 1:
          while (++i < l) (ev = events[i]).callback.call(ev.ctx, a1);
          return;
        case 2:
          while (++i < l) (ev = events[i]).callback.call(ev.ctx, a1, a2);
          return;
        case 3:
          while (++i < l) (ev = events[i]).callback.call(ev.ctx, a1, a2, a3);
          return;
        default:
          while (++i < l) (ev = events[i]).callback.apply(ev.ctx, args);
      }
    },

    /**
     * Subscribe to a certain event `name` with a `callback` function & an optional `context`
     * @param  {String}   name     Event name
     * @param  {Function} callback Event handler
     * @param  {Object=}   context context for `callback`
     * @return {module:utils~Hub}
     */
    on(name, callback, context) {
      if (!name || typeof name !== 'string' || !callback) return this;
      if (!this._eventsApi(this, 'on', name, [callback, context]) || !callback)
        return this;
      this._events || (this._events = {});
      const events = this._events[name] || (this._events[name] = []);
      events.push({ callback, context, ctx: context || this });
      return this;
    },
    /**
     * Subscribe to event `name` with `callback` function & `context` but
     * `callback` will only be trigered once
     * @param  {String}   name     Event name
     * @param  {Function} callback Callback function
     * @param  {Object=}   context  context for `callback`
     * @return {module:utils~Hub}
     */
    once(name, callback, context) {
      if (!name || typeof name !== 'string' || !callback) return this;
      if (
        !this._eventsApi(this, 'once', name, [callback, context]) ||
        !callback
      )
        return this;
      const self = this;
      var once = listenOnce(function () {
        self.off(name, once);
        callback.apply(this, arguments);
      });
      once._callback = callback;
      return this.on(name, once, context);
    },
    /**
     * Unsubscribe to event `name` a specific `callback` function or all function
     * @param  {String}   name     Event name
     * @param  {Function} callback (Optional) event handler function, falsy arg will unsubscribe all handlers for this event
     * @param  {Object=}   context  context for `callback`
     * @return {module:utils~Hub}
     */
    off(name, callback, context) {
      let retain;
      let ev;
      let events;
      let names;
      let i;
      let l;
      let j;
      let k;
      if (
        !this._events ||
        !this._eventsApi(this, 'off', name, [callback, context])
      )
        return this;
      if (!name && !callback && !context) {
        this._events = void 0;
        return this;
      }
      names = name ? [name] : Object.keys(this._events);
      for (i = 0, l = names.length; i < l; i++) {
        name = names[i];
        events = this._events[name];
        if (events) {
          this._events[name] = retain = [];
          if (callback || context) {
            for (j = 0, k = events.length; j < k; j++) {
              ev = events[j];
              if (
                (callback &&
                  callback !== ev.callback &&
                  callback !== ev.callback._callback) ||
                (context && context !== ev.context)
              ) {
                retain.push(ev);
              }
            }
          }
          if (!retain.length) delete this._events[name];
        }
      }
      return this;
    },
    /**
     * Trigger event `name`
     * @param  {String} name Event name
     * @return {module:utils~Hub}
     */
    trigger(name) {
      if (!name || typeof name !== 'string') return this;
      if (!this._events) return this;
      const args = _slice.call(arguments, 1);
      if (!this._eventsApi(this, 'trigger', name, args)) return this;
      const events = this._events[name];
      // _events.all doesn't seem to be set/used anywhere - it's probably fine to remove this
      const allEvents = this._events.all;
      try {
        if (events) this._triggerEvents(events, args);
        if (allEvents) this._triggerEvents(allEvents, arguments);
      } catch (e) {
        const errObj = e instanceof Error ? e : new Error(e);
        logger.error([CONTEXTS.HUB, name], e, {}, errObj);
      }
      return this;
    },
    /**
     * Bridge 1 event to another event, essentially trigger ev2 whenever ev1 is triggered
     * @param  {String} ev1 Source event
     * @param  {String} ev2 Event to be triggered when ev2 is triggered
     * @return {module:utils~Hub}
     */
    bridge(ev1, ev2) {
      if (!ev1 || !ev2) {
        return this;
      }
      this.on(ev1, this.trigger.bind(this, ev2));
      return this;
    },
  };

  hub = new Hub();
} else {
  // If we're not in browser, shim it
  hub = {};
  hub.bridge = function cb() {
    return hub;
  };
  hub.trigger = hub.bridge;
  hub.off = hub.bridge;
  hub.once = hub.bridge;
  hub.on = hub.bridge;
}

hub.E = {
  AUTHENTICATED: 'AUTHENTICATED',
  AUTH_LOAD_HANDLE: 'AUTH_LOAD_HANDLE',
  BECOME_ACTIVE_LISTENER: 'BECOME_ACTIVE_LISTENER',
  BUFFER: 'BUFFER',
  CARD_CHANGE: 'CARD_CHANGE',
  COMPLETE: 'COMPLETE',
  CREATE_RADIO: 'CREATE_RADIO',
  Chromecast: {
    CONNECTED: 'CHROMECAST.CONNECTED',
    DISCONNECTED: 'CHROMECAST.DISCONNECTED',
    MUTE: 'CHROMECAST.MUTE',
    READY: 'CHROMECAST.READY',
    VOLUME: 'CHROMECAST.VOLUME',
  },
  ERROR: 'ERROR',
  FAVORITE: 'FAVORITE',
  // FAVORITE_CHANGE appears to have no listeners, but still has triggers in action middleware
  FAVORITE_CHANGE: 'FAVORITE_CHANGE',
  IDLE: 'IDLE',
  LIVE_RAW_META: 'LIVE_RAW_META',
  LOGOUT: 'LOGOUT',
  MUTE: 'MUTE',
  NAVIGATE: 'NAVIGATE',
  NOT_ACTIVE_STREAMER: 'NOT_ACTIVE_STREAMER',
  PAGE_RENDERED: 'PAGE_RENDERED',
  PAUSE: 'PAUSE',
  PLAY: 'PLAY',
  PLAYER_PLAY_TOGGLED: 'PLAYER_PLAY_TOGGLED',
  PLAYER_PREVIOUS_OD: 'PLAYER_PREVIOUS_OD',
  PLAYER_REPLAY_SET: 'PLAYER_REPLAY_SET',
  PLAYER_REPLAY_SKIP: 'PLAYER_REPLAY_SKIP',
  PLAYER_RESET_STATION: 'PLAYER_RESET_STATION',
  PLAYER_RESTART_OD: 'PLAYER_RESTART_OD',
  PLAYER_SCRUBBER_END: 'PLAYER_SCRUBBER_END',
  PLAYER_SKIP_CLICKED: 'PLAYER_SKIP_CLICKED',
  PLAY_BUT_NOT_REALLY: 'PLAY_BUT_NOT_REALLY',
  PLAY_STATE_CHANGED: 'PLAY_STATE_CHANGED',
  READY: 'READY',
  SEEK_RELATIVE: 'SEEK_RELATIVE',
  STATION_FIRST_PLAY: 'STATION_FIRST_PLAY',
  STATION_LOADED: 'STATION_LOADED',
  STOP: 'STOP',
  THUMB_CHANGED: 'THUMB_CHANGED',
  TIME: 'TIME',
  TRACK_CHANGED: 'TRACK_CHANGED',
  UPDATE_SPEED: 'UPDATE_SPEED',
  URL_LOADED: 'URL_LOADED',
};

export const E = hub.E; // eslint-disable-line prefer-destructuring

export default hub;
