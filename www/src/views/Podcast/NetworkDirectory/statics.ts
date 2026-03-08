import { CONTEXTS } from 'modules/Logger';
import { getPodcastNetworks } from 'state/Podcast/actions';
import { getPodcastNetworks as podcastNetworksSelector } from 'state/Podcast/selectors';
import { Thunk } from 'state/types';

export function getAsyncData(): Thunk<
  Promise<void | {
    notFound: true;
  }>
> {
  return async function thunk(dispatch, getState, { logger }) {
    try {
      const result = await dispatch(getPodcastNetworks());
      if (podcastNetworksSelector(getState()).length) return result;
      return { notFound: true };
    } catch (e: any) {
      const errObj = e instanceof Error ? e : new Error(e);
      logger.error([CONTEXTS.ROUTER, CONTEXTS.PODCAST], errObj, {}, errObj);
      throw errObj;
    }
  };
}
