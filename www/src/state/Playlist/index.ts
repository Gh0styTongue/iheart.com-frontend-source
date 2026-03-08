import createReducer from 'state/createReducer';
import {
  ADD_TRACKS_TO_PLAYLIST,
  DELETE_PLAYLIST,
  DELETE_TRACKS,
  FOLLOW_PLAYLIST_ID,
  RECEIVED_PLAYLISTS,
  SET_PLAYLIST_REQUEST_STATE,
  SHUFFLE_PLAYLIST,
  TOGGLE_FOLLOW,
  UNFOLLOW_PLAYLIST_ID,
  UPDATE_TRACK_ORDER,
} from './constants';
import {
  addTracksToPlaylist,
  deletePlaylist,
  deleteTracks,
  followPlaylistId,
  initialState,
  receiveAllStationTypes,
  receivedPlaylists,
  removePlaylistFromHistory,
  resetAllPlaylists,
  setLastPlayedDate,
  setPlaylistRequestState,
  shuffleCurrentPlaylist,
  toggleFollowed,
  unfollowPlaylistId,
  updateThumbs,
  updateTrackOrder,
} from './reducers';
import {
  RECEIVE_STATIONS as RECEIVE_ALL_STATION_TYPES,
  REMOVE_STATION,
  SET_LAST_PLAYED_DATE,
  UPDATE_THUMBS,
} from 'state/Stations/constants';
import {
  RECEIVE_ANONYMOUS_SESSION,
  RECEIVE_SESSION,
  SOCIAL_AUTH,
} from 'state/Session/constants';
import { State } from './types';

const reducer = createReducer<State>(initialState, {
  [ADD_TRACKS_TO_PLAYLIST]: addTracksToPlaylist,
  [DELETE_PLAYLIST]: deletePlaylist,
  [DELETE_TRACKS]: deleteTracks,
  [FOLLOW_PLAYLIST_ID]: followPlaylistId,
  [RECEIVE_ALL_STATION_TYPES]: receiveAllStationTypes,
  [RECEIVE_ANONYMOUS_SESSION]: resetAllPlaylists,
  [RECEIVE_SESSION]: resetAllPlaylists,
  [RECEIVED_PLAYLISTS]: receivedPlaylists,
  [REMOVE_STATION]: removePlaylistFromHistory,
  [SET_LAST_PLAYED_DATE]: setLastPlayedDate,
  [SET_PLAYLIST_REQUEST_STATE]: setPlaylistRequestState,
  [SHUFFLE_PLAYLIST]: shuffleCurrentPlaylist,
  [SOCIAL_AUTH]: resetAllPlaylists,
  [TOGGLE_FOLLOW]: toggleFollowed,
  [UNFOLLOW_PLAYLIST_ID]: unfollowPlaylistId,
  [UPDATE_THUMBS]: updateThumbs,
  [UPDATE_TRACK_ORDER]: updateTrackOrder,
});

export { initialState };

export default reducer;
