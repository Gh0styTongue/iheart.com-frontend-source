import SaveOverflowDropdown from './SaveOverflowDropdown';
import saveSongs from 'state/YourLibrary/saveSongs';
import {
  addPlaylistToMyMusicSelector,
  savePlaylistSelector,
  saveSongSelector,
} from './selectors';
import {
  addTrackToPlaylistSelector,
  saveTrackPlayerSelector,
} from 'state/Entitlements/selectors';
import { connect } from 'react-redux';
import { createStructuredSelector } from 'reselect';
import {
  getIsAnonymous,
  getProfileId,
  getSessionId,
} from 'state/Session/selectors';
import { getPlaylist } from 'state/Playlist/selectors';
import { requestPlaylist } from 'state/Playlist/actions';
import type { ComponentProps, StateProps } from './types';
import type { State } from 'state/types';

export default connect(
  createStructuredSelector<State, ComponentProps, StateProps>({
    canAddTrackToPlaylist: addTrackToPlaylistSelector,
    canSaveTrack: saveTrackPlayerSelector,
    isAnonymous: getIsAnonymous,
    playlist: getPlaylist,
    profileId: getProfileId,
    sessionId: getSessionId,
    showAddPlaylistToMyMusic: addPlaylistToMyMusicSelector,
    showAddTrackToPlaylist: savePlaylistSelector,
    showSaveSong: saveSongSelector,
  }),
  {
    requestPlaylist,
    saveSongs: saveSongs.action,
  },
)(SaveOverflowDropdown);
