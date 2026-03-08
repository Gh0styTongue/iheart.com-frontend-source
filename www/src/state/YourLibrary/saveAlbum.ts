import saveSongs from './saveSongs';
import { CONTEXTS } from 'modules/Logger';
import { getAlbum } from 'state/Albums/selectors';
import { requestAlbum } from 'state/Albums/actions';
import { Thunk } from 'state/types';

const constant = 'YOUR_LIBRARY:SAVE_ALBUM';

function action(id: number): Thunk<Promise<void>> {
  return async function thunk(dispatch, getState, { logger }) {
    try {
      const state = getState();
      let album = getAlbum(state, { albumId: id });

      if (album.tracks === undefined) {
        album = await dispatch(requestAlbum({ albumId: id }));
      }

      const ids = album.tracks!.map((song): number => song.id);

      await dispatch(saveSongs.action(ids));
    } catch (error: any) {
      const errObj = error instanceof Error ? error : new Error(error);
      logger.error([CONTEXTS.REDUX, constant], errObj.message, {}, errObj);
      throw errObj;
    }
  };
}

export default { action };
