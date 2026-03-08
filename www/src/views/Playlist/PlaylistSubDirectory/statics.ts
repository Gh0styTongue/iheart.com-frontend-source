import { CCR_CONTENT } from 'constants/ccrContent';
import { getCardId } from 'state/PlaylistDirectory/selectors';
import { getParams } from 'state/Routing/selectors';
import { getPlaylistSubdirectory } from 'state/PlaylistDirectory/actions';
import { PAGE_TYPE } from 'constants/pageType';
import { setHasHero } from 'state/Hero/actions';
import { State } from 'state/buildInitialState';
import { Thunk } from 'state/types';

export function getAsyncData(): Thunk<Promise<Array<Record<string, any>>>> {
  return function thunk(dispatch) {
    return Promise.all([
      dispatch(getPlaylistSubdirectory()),
      dispatch(setHasHero(false)),
    ]);
  };
}

export function pageInfo(state: State) {
  const { category, collection, subcategory } = getParams(state);

  return {
    category,
    collection,
    id: getCardId(state, {}).slice(1),
    pageType: PAGE_TYPE.PLAYLIST_SUB_DIRECTORY,
    subcategory,
    targeting: {
      ccrcontent1: CCR_CONTENT.DIRECTORY_PLAYLIST,
      section: subcategory,
    },
  };
}
