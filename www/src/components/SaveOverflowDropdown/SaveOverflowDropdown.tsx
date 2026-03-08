import analytics, { Events } from 'modules/Analytics';
import Dropdown from 'components/Dropdown';
import NavLink from 'components/NavLink';
import UPSELL from 'constants/upsellTracking';
import useFeature from 'hooks/useFeature';
import useTranslate from 'contexts/TranslateContext/useTranslate';
import { ConnectedModals } from 'state/UI/constants';
import { getFollowAnalyticsData } from 'modules/Analytics/legacyHelpers';
import { openModal, openSignupModal, openUpsellModal } from 'state/UI/actions';
import { SaveDeleteComponent } from 'modules/Analytics/helpers/saveDelete';
import { STATION_TYPE } from 'constants/stationTypes';
import { useCallback, useMemo } from 'react';
import { useDispatch } from 'react-redux';

import type { ComponentProps, ConnectedProps } from './types';
import type { FunctionComponent, ReactNode } from 'react';
import type { Track } from 'state/Tracks/types';

type Props = ComponentProps & ConnectedProps;

export const TESTID = 'SaveOverflowDropdown';
const subTestid = (testid: string) => `${TESTID}-${testid}`;
export const SAVE_TRACK_TO_MYMUSIC_TESTID = subTestid(
  'saveTrackToMyMusicButton',
);
export const ADD_TRACK_TO_PLAYLIST_TESTID = subTestid(
  'addTrackToPlaylistButton',
);
export const SAVE_PLAYLIST_TO_MYMUSIC_TESTID = subTestid(
  'savePlaylistToMyMusicButton',
);

const SaveOverflowDropdown: FunctionComponent<Props> = ({
  canAddTrackToPlaylist,
  catalogId,
  catalogType,
  dropdownExtendDown = false,
  isAnonymous,
  playlist,
  playlistId,
  playlistUserId,
  profileId,
  requestPlaylist,
  showAddPlaylistToMyMusic,
  showAddTrackToPlaylist,
}) => {
  const dispatch = useDispatch();
  const translate = useTranslate();
  const isFreeUserPlaylistEnabled = useFeature('freeUserMyPlaylist');
  const isInternationalPlaylistRadioEnabled = useFeature(
    'internationalPlaylistRadio',
  );

  const addTrackToPlaylist = useCallback(() => {
    if (
      canAddTrackToPlaylist ||
      ((isFreeUserPlaylistEnabled || isInternationalPlaylistRadioEnabled) &&
        !isAnonymous)
    ) {
      dispatch(
        openModal({
          id: ConnectedModals.AddToPlaylist,
          context: {
            component: SaveDeleteComponent.Overflow,
            trackIds: [catalogId],
            type: catalogType,
          },
        }),
      );
    } else if (isAnonymous) {
      dispatch(openSignupModal({ context: 'add_to_playlist' }));
    } else {
      dispatch(
        openUpsellModal({
          upsellFrom: UPSELL.LIVE_RADIO_ADD_TO_PLAYLIST,
          headerCopy: translate(
            'Create unlimited playlists. Try iHeart All Access.',
          ),
        }),
      );
    }
  }, [
    canAddTrackToPlaylist,
    catalogId,
    catalogType,
    dispatch,
    isAnonymous,
    isFreeUserPlaylistEnabled,
    isInternationalPlaylistRadioEnabled,
    translate,
  ]);

  const savePlaylistToMyMusic = useCallback(
    async (playlistID: string, playlistUserID: string) => {
      let playlistToSave = playlist;

      if (Object.keys(playlist).length === 0) {
        const requestedPlaylist = await requestPlaylist({
          playlistId: playlistID,
          playlistUserId: playlistUserID,
        });
        playlistToSave = requestedPlaylist?.payload?.playlists[0] ?? {};
      }

      const tracks: Array<Track> = playlistToSave?.tracks ?? [];
      const name = playlistToSave?.name ?? '';

      const trackIds = tracks.map(({ trackId }) => trackId);

      dispatch(
        openModal({
          id: ConnectedModals.CreatePlaylist,
          context: {
            name,
            tracks: trackIds,
            showGrowl: false,
          },
        }),
      );

      analytics.track(
        Events.FollowUnfollow,
        getFollowAnalyticsData({
          followed: true,
          name,
          playlist,
          profileId,
        }),
      );
    },
    [dispatch, playlist, profileId, requestPlaylist],
  );

  const dropdownItems: Array<ReactNode> = useMemo(() => {
    const items: Array<ReactNode> = [];

    if (
      (showAddTrackToPlaylist || isFreeUserPlaylistEnabled) &&
      catalogType === STATION_TYPE.TRACK
    ) {
      items.push(
        <NavLink
          css={{ padding: '1rem 1.5rem' }}
          dataTest={ADD_TRACK_TO_PLAYLIST_TESTID}
          key="add-to-playlist"
          onClick={addTrackToPlaylist}
          title={translate('Add to Playlist')}
        >
          {translate('Add to Playlist')}
        </NavLink>,
      );
    }

    if (showAddPlaylistToMyMusic && playlistId && playlistUserId) {
      items.push(
        <NavLink
          dataTest={SAVE_PLAYLIST_TO_MYMUSIC_TESTID}
          key="save-playlist"
          onClick={() => savePlaylistToMyMusic(playlistId, playlistUserId)}
          title={translate('Save Playlist')}
        >
          {translate('Save Playlist')}
        </NavLink>,
      );
    }

    return items;
  }, [
    addTrackToPlaylist,
    isFreeUserPlaylistEnabled,
    playlistId,
    playlistUserId,
    savePlaylistToMyMusic,
    showAddPlaylistToMyMusic,
    showAddTrackToPlaylist,
    translate,
  ]);

  if (dropdownItems.length) {
    /* eslint-disable jsx-a11y/anchor-is-valid */
    return (
      <Dropdown dataTest={TESTID} extendDown={dropdownExtendDown}>
        {dropdownItems}
      </Dropdown>
    );
    /* eslint-enable jsx-a11y/anchor-is-valid */
  }
  // if search result doesn't have the right catalog type or the user doesn't
  // have the right entitlement, don't display an overflow menu
  return null;
};

export default SaveOverflowDropdown;
