/* eslint-disable sort-keys */

import analytics from 'modules/Analytics';
import composeRequest, { requestName, url } from 'api/helpers';
import createTransport from 'api/transport/createTransport';
import factory from 'state/factory';
import getScript from 'utils/getScript';
import logger, { CONTEXTS } from 'modules/Logger';
import { merge as _merge, noop } from 'lodash-es';
import { blankMP4 } from 'constants/assets';

// TODO - DN - Externalize to config, so we can change at runtime
const JW_SCRIPT =
  'https://web-static.pages.iheart.com/jw-player/8.7.6/jwplayer.js';
const JW_KEY = 'NgcfD49HOaKFwoEzfSmRRM5GTfZEVq7IdFNb+g==';
const DEFAULT_OPTIONS = {
  config: {
    blankFile: blankMP4,
  },
  // Dmitry: Default values to Main.js events
  events: {
    // happens when jw has received it's url, but hasn't actually started playing yet, we primarily
    // use it to fire prerolls (which is per jw's documentation)
    onBeforePlay: noop,
    // when JW has loaded, and you can actually play things
    onReady: noop,
    // when it is no longer in a playing state
    onIdle: noop,
    // when you change the volume
    onVolume: noop,
    // when JW can't initialize for some reason
    onSetupError: noop,
    // fires ~0.5s
    onTime: noop,
    // when content actually starts playing
    onPlay: noop,
    // when you pause
    onPause: noop,
    // when you mute
    onMute: noop,
    // when metadata is recieved. Please note that there are two different kinds of meta events
    // that both fire through this. One is tied to receiving manifests, the other is tied to
    // receiving the actual chunks. Broadly we prefer to consume the chunks rather than the
    // manifests
    // only used for live
    onMeta: noop,
    // Something went wrong
    onError: noop,
    // the song has finished, but we haven't officially stopped yet. We use this to proc ads in custom
    onBeforeComplete: noop,
    // the song has actually finished. We use this mostly to call _next
    onComplete: noop,
    // we're buffering
    onBuffer: noop,
  },
};

const setupJw = (function setupJw() {
  let _jwplayer; // underscored so it does not conflict with window.jwplayer which we do not control

  return async function setupJwGlobally() {
    return new Promise((resolve, reject) => {
      window.addEventListener('load', async () => {
        if (!_jwplayer) {
          _jwplayer = getScript(JW_SCRIPT, null, { persist: true }).then(() => {
            if (!window.jwplayer) {
              reject(
                new Error(`Failed to load jwplayer script from ${JW_SCRIPT}`),
              );
            }

            window.jwplayer.key = JW_KEY;
            return window.jwplayer;
          });
        }

        resolve(_jwplayer);
      });
    });
  };
})();

export default class Driver {
  constructor(options) {
    const { config, events } = _merge({}, DEFAULT_OPTIONS, options);
    const { blankFile } = config;
    this.config = config;

    try {
      setupJw().then(jwplayer => {
        this.instance = jwplayer('jw-player').setup({
          file: blankFile,
          // alternative is flash
          primary: 'html5',
          controls: true,
          autostart: false,
          hlshtml: true,
          width: 640,
          height: 480,
          type: 'mp4',
          rtmp: {
            bufferlength: 1,
          },
        });

        this._afterSetup(events);
      });
    } catch (error) {
      logger.error(CONTEXTS.JW_PLAYER, {}, {}, error);
      this.events.onSetupError(error);
    }
  }

  _afterSetup(events) {
    /* WEB-11055 - ZS -
     * apply the callbacks that are set for the player events
     */
    Object.keys(events).forEach(fn => {
      this.instance.on(fn, (...args) => events[fn].apply(null, args));
    });
  }

  _isPlsFile(file) {
    // pls manifests aren't manually resolvable by JW, so we have to call them and parse the manifest
    // manually
    const re = /.*\.pls/;

    return re.exec(file) !== null;
  }

  _parsePlsFileThenPlay(file) {
    const transport = createTransport(factory);
    // call for a pls file
    return transport(
      composeRequest(url(file), requestName('pls file request'))(),
    )
      .then(({ data: text }) => {
        const re = /File\d=(.*)/g;
        let match;
        const streamUrls = [];

        do {
          match = re.exec(text);
          if (match) {
            // extract and load an actual aac payload which JW can understand
            streamUrls.push({
              file: match[1],
              preload: 'auto',
              type: 'aac',
            });
          }
        } while (match);
        // return to the normal url process
        this.loadUrlHelper(streamUrls);
      })
      .catch(err => {
        logger.error(CONTEXTS.JW_PLAYER, {}, {}, err);
        // horrible hack to simulate jw failure on pls streams
        this.events.onError(err);
      });
  }

  loadUrl(file, type) {
    if (this._isPlsFile(file)) {
      this._parsePlsFileThenPlay(file);
    } else {
      this.loadUrlHelper([
        {
          file,
          type,
          preload: 'auto',
        },
      ]);
    }
  }

  loadUrlHelper(items) {
    this.instance.load(items);
    this.play();
  }

  stop() {
    this.stopReal();
  }

  stopReal() {
    return this.instance.stop();
  }

  play() {
    return this.instance.play();
  }

  pause() {
    return this.instance.pause();
  }

  seek(time) {
    return this.instance.seek(time);
  }

  destroy() {
    this.instance.remove();
    return this;
  }

  mute() {
    this.instance.setMute(true);
    return true;
  }

  unmute() {
    this.instance.setMute(false);
    return false;
  }

  setVolume(volume) {
    analytics.setGlobalData({ volume });
    this.instance.setVolume(volume);
    return volume;
  }

  getVolume() {
    return this.instance.getVolume();
  }

  getState() {
    return this.instance.getState();
  }

  getPosition() {
    return this.instance.getPosition();
  }
}
