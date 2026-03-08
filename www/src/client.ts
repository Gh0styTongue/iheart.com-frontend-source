if (__DEV__ && module.hot) module.hot.accept();

import analytics from 'modules/Analytics';
import chromecast from 'web-player/chromecast';
import ClientRouter from 'router/ClientRouter';
import countryCodes from 'constants/countryCodes';
import factory from 'state/factory';
import hub from 'shared/utils/Hub';
import logger, { CONTEXTS } from 'modules/Logger';
import player from 'web-player';
import ReactDOM from 'react-dom';
import setupAuthListeners from 'shims/setupAuthListeners';
import title from 'ui/Title';
import { authenticate } from 'state/Session/actions';
import { createElement } from 'react';
import { getCountryCode } from 'state/Config/selectors';
import { getEnv, getIsBot } from 'state/Environment/selectors';
import { getPermutivePixel, identifyPermutive } from 'vendor/permutive';
import { ImageEmitter } from 'utils/imageEmitter';
import { loadableReady } from '@loadable/component';
import { queryForABTestGroup } from 'state/ABTestGroups/actions';
import { requestCurrentLocationAndMarket } from 'state/Location/helpers';

async function main() {
  /**
   * `window.COMSCORE.beacon` ultimately constructs an Image, and sets the `src` to be the value
   *  of the tracking call. In order to fire the Pageview Candidate call AFTER the tracking call
   *  (which is what I'm assuming needs to happen from studying the documentation)... we need to
   *  be able to trap both the `Image` constructor, and any `set` calls that occur on properties
   *  returned from the constructor (e.g., `img.src = something;`);
   *
   *  More information line-by-line below
   */

  // De-reference the `Image` constructor from the window
  const { Image } = window;
  // Create a Proxy wrapper around `Image`
  const ProxyImage = new Proxy(Image, {
    // We need to be able to trap `src` assignments, so we have to proxy the constructor
    // With a Proxy wrapper of its own
    construct(ctorTarget, ctorArgs, newTarget) {
      // Create the handler for the Proxy returned from the constructor
      const handler = {
        set(
          target: HTMLImageElement,
          property: keyof HTMLImageElement,
          value: any,
        ) {
          // Call `ImageEmitter.set`, so that the subscriptions set in the comscore tracker
          // will fire
          ImageEmitter.set(property, value);
          // Finally, use `Reflect.set` to send the value to the underlying `Image`
          return Reflect.set(target, property, value);
        },
        // In cases where the property accessor is a function, we must bind the target's `this`
        get(target: HTMLImageElement, property: keyof HTMLImageElement) {
          if (typeof target[property] === 'function') {
            return target[property].bind(target);
          }
          return target[property];
        },
      };
      // Return a Proxy from the constructor, using `Reflect.construct` to construct the
      // the `Image` behind
      return new Proxy(
        Reflect.construct(ctorTarget, ctorArgs, newTarget),
        handler,
      );
    },
  });
  // Finally "overwrite" `window.Image` with our new `ProxyImage`
  Reflect.set(window, 'Image', ProxyImage);

  const store = factory();
  const state = store.getState();
  const env = getEnv(state);
  const isCrawler = getIsBot(state);

  if (env !== 'prod') {
    hub.on('all', (evName: string, ...args: Array<any>) => {
      switch (evName) {
        case 'ihrplayer:status:adtime':
        case 'ihrplayer:status:time':
        case 'ihrplayer:status:liveRawMeta':
          return;
        default:
          logger.info([CONTEXTS.HUB, evName], args);
      }
    });
  }

  requestCurrentLocationAndMarket(store);

  setupAuthListeners();

  window.app = {
    analytics,
    chromecast,
    logger,
    player,
    title,
  };

  await loadableReady();

  await store.dispatch(authenticate());

  // AMP's AB test endpoint does not support WW
  // and we don't need AB test support for WW
  if (getCountryCode(state) !== countryCodes.WW) {
    /* For each user we need to place them into an abTestGroup. */
    await store.dispatch(queryForABTestGroup());
  }

  ReactDOM.hydrate(
    createElement(ClientRouter),
    document.getElementById('page-view-container'),
  );

  const permutivePixel = await getPermutivePixel();

  if (permutivePixel) {
    document.getElementById('page-view-container')?.appendChild(permutivePixel);
  }

  await identifyPermutive();

  analytics.setIsCrawler(isCrawler);

  /**
   * After we have loaded entitlements we have all the global data we need
   * make analytics calls. At this point we can set our analytics readyState to
   * true.
   */
  analytics.setReadyState(true);

  const SEVENTY_TWO_HOURS = 259200 * 1000;

  player.setupTimer(SEVENTY_TWO_HOURS, SEVENTY_TWO_HOURS);
}

main();
