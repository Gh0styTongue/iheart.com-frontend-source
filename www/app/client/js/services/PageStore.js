import hub, { E } from 'shared/utils/Hub';
import { memoize, merge } from 'lodash-es';

function PageStore() {
  this._state = {};
  hub.on(E.NAVIGATE, this._onNavigate, this);
  hub.on(E.PAGE_RENDERED, this._onPageRendered, this);
}

PageStore.prototype._onNavigate = function _onNavigate() {
  this._state.prevHref = window.location.href;
};

PageStore.prototype._onPageRendered = function _onPageRendered(data = {}) {
  /**
   * Ticket: https://ihm-it.atlassian.net/browse/IHRWEB-14972
   *
   * This code to scroll to the top of the window has existed for a longer
   * period of time. It is here because of the way our routing layer works. Our
   * app is a single page application, so if a user scrolls down on one page and
   * navigates, the correct behavior is for the page to be scrolled to the top
   * once again. If this code was not here, then the previous scroll position
   * would persist. This being said, there are times when you want to navigate
   * to specific items on the page through URL hashes. Currently, that is not
   * possible and created the bug listed in the ticket above. One day, the hope
   * is to completely refactor our routing layer on both the client and server,
   * but for right now, this will have to do.
   */

  if (window.location.hash) {
    const [, hash] = window.location.hash.split('#');
    const element = document.querySelector(`[name="${hash}"], [id="${hash}"]`);
    window.scrollTo(0, element?.offsetTop ?? 0);
  } else {
    window.scrollTo(0, 0);
  }

  this._state = merge({}, data, {
    route: window.location.pathname.substr(1) || window.location.hash.substr(1),
  });
  hub.trigger(E.CARD_CHANGE, this._state);
};

PageStore.prototype.getState = function getState() {
  return this._state;
};

export const getInstance = memoize(() => new PageStore());
