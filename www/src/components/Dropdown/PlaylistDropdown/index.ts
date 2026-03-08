import Dropdown from './Dropdown';
import { connect } from 'react-redux';
import { createStructuredSelector } from 'reselect';
import { deleteFromListenHistory } from 'state/Stations/actions';
import { deleteRecByTypeAndId } from 'state/Recs/actions';
import { editPlaylistSelector } from 'state/Entitlements/selectors';
import { flowRight } from 'lodash-es';
import { getShowPlaylistButtons } from 'state/Playlist/selectors';
import { localize } from 'redux-i18n';
import {
  openRemovePlaylistModal,
  showPlaylistFollowedGrowl,
} from 'state/UI/actions';
import { removeMyMusicCollection } from 'state/MyMusic/actions';
import { State } from 'state/types';
import { updateFollowPlaylists } from 'state/Playlist/actions';

// TODO: Replace HOCs with hook counterparts
export default flowRight(
  localize('translate'),
  connect(
    createStructuredSelector<
      State,
      {
        playlistId?: string | undefined;
        playlistUserId?: string | undefined;
        seedId?: string | number | undefined;
      },
      {
        canEditPlaylist: boolean;
        showPlaylistButtons: boolean;
      }
    >({
      canEditPlaylist: editPlaylistSelector,
      showPlaylistButtons: getShowPlaylistButtons,
    }),
    {
      deleteFromListenHistory,
      deleteRecByTypeAndId,
      openRemovePlaylistModal,
      removeMyMusicCollection,
      showPlaylistFollowedGrowl,
      updateFollowPlaylists,
    },
  ),
)(Dropdown);
