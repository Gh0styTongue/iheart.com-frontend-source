import nameSorter from 'utils/nameSorter';
import { createSelector } from 'reselect';
import { getCollectionsByIds } from 'state/MyMusic/selectors';
import { Playlist } from 'state/Playlist/types';
import { Selector } from 'state/types';

const selectPlaylists: Selector<Array<Playlist>> = createSelector(
  getCollectionsByIds,
  playlists => Object.values(playlists).sort(nameSorter) || [],
);

export default {
  selectors: {
    selectPlaylists,
  },
};
