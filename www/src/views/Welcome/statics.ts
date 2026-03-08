import loadNewsArticles from 'state/News/actions/loadNewsArticles';
import { CONTEXTS } from 'modules/Logger';
import { fetchGenrePreferences } from 'state/Genres/actions';
import { fetchListenHistory } from 'state/Stations/actions';
import { getArtists } from 'state/Artists/actions';
import { getEvents } from 'state/Events/actions';
import { getHero } from 'state/Hero/actions';
import { getPodcasts } from 'state/Podcast/actions';
import { NEWS_DIRECTORY_SLUG } from 'state/News/constants';
import type { State, Thunk } from 'state/types';

export function getAsyncData(): Thunk<Promise<void>> {
  return async function thunk(dispatch, _, { logger }) {
    const promises = [
      dispatch(getArtists()),
      dispatch(getHero()),
      dispatch(getEvents()),
      dispatch(loadNewsArticles(NEWS_DIRECTORY_SLUG)).catch((e: Error) => {
        logger.error(
          [CONTEXTS.ROUTER, CONTEXTS.YOUR_LIBRARY],
          e.message,
          {},
          e,
        );
      }),
      dispatch(fetchGenrePreferences()),
    ];

    if (__CLIENT__) {
      /**
       * This is needed to hide or show the mini player depending on if the user
       * has listen history. Should only be fired off on the client because we
       * are able to authenticate users on the client only.
       */
      promises.push(dispatch(fetchListenHistory()));
    } else {
      // Don't dispatch on Client as the component has a fallback to try again
      promises.push(dispatch(getPodcasts()));
    }
    await Promise.all(promises);
  };
}

export function pageInfo(_state: State) {
  return {
    targeting: {
      ccrcontent1: 'home',
    },
  };
}
