import createReducer from 'state/createReducer';
import getAlbumSongs from './getAlbumSongs';
import getArtistSongs from './getArtistSongs';
import getSavedStations from './getSavedStations';
import getSongs from './getSongs';
import removeSavedStation from './removeSavedStation';
import removeSongs from './removeSongs';
import resetNextPageKey from './resetNextPageKey';
import saveSongs from './saveSongs';
import { State } from './types';

export const initialState: State = {
  savedStations: {
    info: {},
    order: [],
  },
  songs: {
    ids: {},
    nextPageKey: null,
  },
};

const reducer = createReducer<State>(initialState, {
  [getAlbumSongs.constant]: getSongs.reducer,
  [getArtistSongs.constant]: getSongs.reducer,
  [getSavedStations.constant]: getSavedStations.reducer,
  [getSongs.constant]: getSongs.reducer,
  [removeSavedStation.constant]: removeSavedStation.reducer,
  [removeSongs.constant]: removeSongs.reducer,
  [resetNextPageKey.constant]: resetNextPageKey.reducer,
  [saveSongs.constant]: saveSongs.reducer,
});

export default reducer;
