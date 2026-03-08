import { CONTEXTS } from 'modules/Logger';
import { get } from 'lodash-es';
import {
  getCountryCode,
  getPlaylistDirectoryMainUrl,
} from 'state/Config/selectors';
import { getParams } from 'state/Routing/selectors';
import { playlistDirectoryQuery } from 'state/PlaylistDirectory/services';
import {
  RECEIVE_PLAYLIST_DIRECTORY,
  REJECT_PLAYLIST_DIRECTORY,
  SEED_CATEGORIES,
} from 'state/PlaylistDirectory/constants';

export function receivePlaylistDirectory(tiles) {
  return {
    payload: { tiles },
    type: RECEIVE_PLAYLIST_DIRECTORY,
  };
}

export function rejectPlaylistDirectory(error) {
  return {
    error,
    type: REJECT_PLAYLIST_DIRECTORY,
  };
}

export function getPlaylistSubdirectory() {
  return async function thunk(dispatch, getState, { logger, transport }) {
    const state = getState();
    const country = getCountryCode(state);
    const endpoint = getPlaylistDirectoryMainUrl(state);
    const { category, collection, subcategory } = getParams(state);
    let categoryData = {};
    try {
      categoryData = await transport(
        playlistDirectoryQuery({
          collection: get(SEED_CATEGORIES, ['ROOT', 'collection']),
          country,
          endpoint,
          facets: get(SEED_CATEGORIES, ['ROOT', 'facets']),
        }),
      );
    } catch (e) {
      const errObj =
        e instanceof Error ? e : new Error(e.statusText ?? 'error');
      logger.error(
        [CONTEXTS.REDUX, CONTEXTS.PLAYLIST],
        errObj.message,
        {},
        errObj,
      );
      throw e;
    }

    let subcategoryData = {};
    try {
      subcategoryData = await transport(
        playlistDirectoryQuery({
          collection: `collections/${collection}`,
          country,
          endpoint,
          facets: `${category}/${subcategory}`,
        }),
      );
    } catch (e) {
      const errObj =
        e instanceof Error ? e : new Error(e.statusText ?? 'error');
      logger.error(
        [CONTEXTS.REDUX, CONTEXTS.PLAYLIST],
        errObj.message,
        {},
        errObj,
      );
      throw e;
    }

    dispatch(
      receivePlaylistDirectory([
        ...get(categoryData, 'data.cards', []),
        ...get(subcategoryData, 'data.cards', []),
      ]),
    );
  };
}
