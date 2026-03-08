import { CCR_CONTENT } from 'constants/ccrContent';
import { CONTEXTS } from 'modules/Logger';
import { get } from 'lodash-es';
import {
  getCountryCode,
  getPlaylistDirectoryMainUrl,
} from 'state/Config/selectors';
import { PAGE_TYPE } from 'constants/pageType';
import { playlistDirectoryQuery } from 'state/PlaylistDirectory/services';
import { receivePlaylistDirectory } from 'state/PlaylistDirectory/actions';
import { SEED_CATEGORIES } from 'state/PlaylistDirectory/constants';
import { setHasHero } from 'state/Hero/actions';
import { Thunk } from 'state/types';

export function getAsyncData(): Thunk<Promise<void>> {
  return async function thunk(dispatch, getState, { logger, transport }) {
    const state = getState();
    let data = {};
    try {
      data = await transport(
        playlistDirectoryQuery({
          collection: get(SEED_CATEGORIES, ['ROOT', 'collection']),
          country: getCountryCode(state),
          endpoint: getPlaylistDirectoryMainUrl(state),
          facets: get(SEED_CATEGORIES, ['ROOT', 'facets']),
        }),
      );
    } catch (e: any) {
      const errObj = new Error(
        (e?.statusText || e?.message) ?? 'error getting playlist directory',
      );
      logger.error(
        [CONTEXTS.ROUTER, CONTEXTS.PLAYLIST],
        errObj.message,
        {},
        errObj,
      );
      throw errObj;
    }
    await Promise.all([
      dispatch(receivePlaylistDirectory(get(data, 'data.cards'))),
      dispatch(setHasHero(false)),
    ]);
  };
}

export function pageInfo() {
  return {
    pageType: PAGE_TYPE.PLAYLIST_DIRECTORY,
    targeting: {
      ccrcontent1: CCR_CONTENT.DIRECTORY_PLAYLIST,
    },
  };
}
