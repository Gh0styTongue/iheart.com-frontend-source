import NavLink from 'components/NavLink';
import ReorderPlaylistContext from 'contexts/ReorderPlaylist';
import ShouldShow from 'components/ShouldShow';
import TileDropdown from 'components/Tile/primitives/TileDropdown';
import { decodePlaylistSeedId } from 'state/Playlist/helpers';
import { IGetTranslateFunctionResponse } from 'redux-i18n';
import { Menu } from 'components/Tooltip';
import { PureComponent, ReactNode } from 'react';
import { REC_TYPE } from 'state/Recs/constants';
import { RemovePlaylistContext } from 'components/RemovePlaylistModal/RemovePlaylistModal';
import { STATION_TYPE } from 'constants/stationTypes';
import { Track } from 'state/Tracks/types';
import type { showPlaylistFollowedGrowl as showPlaylistFollowedGrowlAction } from 'state/UI/actions';

export type Props = {
  canEditPlaylist: boolean;
  showPlaylistButtons: boolean;
  curated: boolean;
  deletable: boolean;
  deleteRecByTypeAndId: (
    type: string,
    id: string | number,
    dlType?: string,
  ) => void;
  deleteFromListenHistory: ({
    seedId,
    stationId,
    stationType,
  }: {
    seedId: string;
    stationId: string;
    stationType: string;
  }) => void;
  recType: string;
  followed: boolean;
  id: string;
  name: string;
  openRemovePlaylistModal: (context: RemovePlaylistContext) => void;
  playlistId: string;
  recentlyPlayed: boolean;
  removeMyMusicCollection: (playlist: {
    id: number | string;
    userId: number;
  }) => void;
  seedId: number;
  seedType: string;
  showPlaylistFollowedGrowl: typeof showPlaylistFollowedGrowlAction;
  tracks: Array<Track>;
  translate: IGetTranslateFunctionResponse;
  tileType: string;
  url: string;
  userId: number;
  updateFollowPlaylists: ({
    followed,
    seedId,
    playlistUserId,
    playlistId,
  }: {
    followed: boolean;
    seedId: string;
    playlistUserId: number;
    playlistId: string;
  }) => void;
  writeable: boolean;
};

class Dropdown extends PureComponent<Props> {
  onRemovePlaylist = () => {
    const { name, openRemovePlaylistModal, playlistId, userId } = this.props;

    openRemovePlaylistModal({
      playlist: {
        id: playlistId,
        name,
      },
      userId,
    });
  };

  onToggleFollowed(isFollowed: boolean) {
    const { updateFollowPlaylists, id, showPlaylistFollowedGrowl } = this.props;
    const { playlistId, userId } = decodePlaylistSeedId(id);
    updateFollowPlaylists({
      followed: isFollowed,
      playlistId,
      playlistUserId: userId,
      seedId: id,
    });

    showPlaylistFollowedGrowl({ isFollowed });
  }

  onDismissRec() {
    const { deleteRecByTypeAndId, recType, seedId, seedType } = this.props;
    deleteRecByTypeAndId(seedType, seedId, recType);
  }

  getOptions(): Array<ReactNode> {
    const {
      curated,
      deletable,
      deleteFromListenHistory,
      followed,
      id,
      recentlyPlayed,
      seedId,
      tracks,
      translate,
      tileType,
      url,
      writeable,
      showPlaylistButtons,
    } = this.props;
    const options: Array<JSX.Element> = [];

    if (tracks?.length > 0 && writeable) {
      options.push(
        <Menu.Item key="menu-item-edit-playlist">
          <ReorderPlaylistContext.Consumer key={`edit-${id}`}>
            {({ update }) => (
              <NavLink
                dataTest="edit-playlist"
                onClick={() => {
                  update(true);
                  return true;
                }}
                title={translate('Edit Playlist')}
                to={url}
              >
                {translate('Edit Playlist')}
              </NavLink>
            )}
          </ReorderPlaylistContext.Consumer>
        </Menu.Item>,
      );
    }

    if (recentlyPlayed) {
      options.push(
        <Menu.Item key="menu-item-remove-playlist">
          <NavLink
            key={`remove|${id}`}
            onClick={() =>
              deleteFromListenHistory({
                seedId: id,
                stationId: id,
                stationType: STATION_TYPE.COLLECTION,
              })
            }
            title={translate('Delete')}
          >
            {translate('Delete')}
          </NavLink>
        </Menu.Item>,
      );
    }

    if (deletable && !curated && tileType) {
      options.push(
        <Menu.Item key="menu-item-delete-playlist">
          <NavLink
            dataTest="delete-playlist"
            key={`delete|${id}`}
            onClick={this.onRemovePlaylist}
            title={translate('Delete Playlist')}
          >
            {translate('Delete Playlist')}
          </NavLink>
        </Menu.Item>,
      );
    }

    if (followed && curated) {
      options.push(
        <Menu.Item key="menu-item-un-follow-playlist">
          <NavLink
            key={`unfollow|${id}`}
            onClick={() => this.onToggleFollowed(false)}
            title={translate('Unfollow Playlist')}
          >
            {translate('Unfollow Playlist')}
          </NavLink>
        </Menu.Item>,
      );
    }
    if (!followed && curated && showPlaylistButtons) {
      options.push(
        <Menu.Item key="menu-item-follow-playlist">
          <NavLink
            key={`follow|${id}`}
            onClick={() => this.onToggleFollowed(true)}
            title={translate('Follow Playlist')}
          >
            {translate('Follow Playlist')}
          </NavLink>
        </Menu.Item>,
      );
    }

    if (tileType === REC_TYPE.RECOMMENDATION) {
      options.push(
        <Menu.Item key="menu-item-not-for-me-playlist">
          <NavLink
            key={`notForMe|${seedId}`}
            onClick={() => this.onDismissRec()}
            title={translate('Not for Me')}
          >
            {translate('Not for Me')}
          </NavLink>
        </Menu.Item>,
      );
    }

    return options;
  }

  render() {
    const options = this.getOptions();
    return (
      <ShouldShow shouldShow={options.length > 0}>
        <TileDropdown data-test="station-tile-dropdown">
          <Menu>
            <Menu.List>{options}</Menu.List>
          </Menu>
        </TileDropdown>
      </ShouldShow>
    );
  }
}

export default Dropdown;
