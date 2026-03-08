import ArtistSongRows from './ArtistSongRows';
import PlayerStateProxy from 'components/Player/PlayerState/PlayerStateProxy';
import saveSongs from 'state/YourLibrary/saveSongs';
import { AddToPlaylistContext } from 'components/AddToPlaylistModal';
import {
  albumOverflowsSelector,
  getCurrentArtistStationId,
} from 'state/Artists/selectors';
import { connect } from 'react-redux';
import { ConnectedModals } from 'state/UI/constants';
import { createStructuredSelector } from 'reselect';
import {
  editPlayableAsRadioSelector,
  getAllAccessPreview,
  getIsUserPremium,
  trackOverflowSelector,
} from 'state/Entitlements/selectors';
import { flowRight } from 'lodash-es';
import {
  getCountryCode,
  getMediaServerUrl,
  getSiteUrl,
  getStationSoftgate,
} from 'state/Config/selectors';
import {
  getCustomRadioEnabled,
  getInternationalPlaylistRadioEnabled,
  getOnDemandEnabled,
} from 'state/Features/selectors';
import { getIsAnonymous, getIsLoggedOut } from 'state/Session/selectors';
import { getTracksThumbsSentiments } from 'state/Tracks/selectors';
import { IGetTranslateFunctionResponse, localize } from 'redux-i18n';
import {
  openModal,
  openSignupModal,
  openUpsellModal,
  showNotifyGrowl,
} from 'state/UI/actions';
import { Sentiment } from 'state/Stations/types';
import { State } from 'state/types';
import { StationSoftgate } from 'state/Config/types';
import { updateThumbsData } from 'state/Stations/actions';
import { withTheme } from '@emotion/react';
import type { ConnectedComponentType } from 'utility';
import type { Theme } from 'styles/themes/default';

type ConnectedProps = {
  canEditPlayableAsRadio: boolean;
  countryCode: string;
  isAllAccessPreview: boolean;
  isAnonymous: boolean;
  isCustomRadioEnabled: boolean;
  isInternationalPlaylistRadioEnabled: boolean;
  isLoggedOut: boolean;
  isPremiumUser: boolean;
  mediaServerUrl: string;
  onDemandEnabled: boolean;
  overflowEntitlements: { show: boolean; showAdd: boolean; showSave: boolean };
  showTrackOverflow: boolean;
  siteUrl: string;
  stationId: string | number;
  stationSoftgate: StationSoftgate;
  thumbs: Record<number, Sentiment>;
};

export default flowRight(
  PlayerStateProxy,
  localize('translate'),
  withTheme,
  connect(
    createStructuredSelector<State, ConnectedProps>({
      canEditPlayableAsRadio: editPlayableAsRadioSelector,
      countryCode: getCountryCode,
      isAllAccessPreview: getAllAccessPreview,
      isAnonymous: getIsAnonymous,
      isCustomRadioEnabled: getCustomRadioEnabled,
      isInternationalPlaylistRadioEnabled: getInternationalPlaylistRadioEnabled,
      isLoggedOut: getIsLoggedOut,
      isPremiumUser: getIsUserPremium,
      mediaServerUrl: getMediaServerUrl,
      onDemandEnabled: getOnDemandEnabled,
      overflowEntitlements: albumOverflowsSelector,
      showTrackOverflow: trackOverflowSelector,
      siteUrl: getSiteUrl,
      stationId: getCurrentArtistStationId,
      stationSoftgate: getStationSoftgate,
      thumbs: getTracksThumbsSentiments,
    }),
    {
      saveSongs: saveSongs.action,
      updateThumbsData,
      openAddToPlaylist: (context: AddToPlaylistContext) =>
        openModal({
          id: ConnectedModals.AddToPlaylist,
          context,
        }),
      openSignup: (context: string) => openSignupModal({ context }),
      openUpsellModal,
      showNotifyGrowl,
    },
  ),
)(ArtistSongRows) as ConnectedComponentType<
  typeof ArtistSongRows,
  ConnectedProps & {
    currentlyPlaying: any;
    translate: IGetTranslateFunctionResponse;
    playingState: string;
    openSignup: (context: string) => void;
    openAddToPlaylist: (context: AddToPlaylistContext) => void;
    openUpsellModal: typeof openUpsellModal;
    showNotifyGrowl: typeof showNotifyGrowl;
    theme: Theme;
    updateThumbsData: (thumbsData: Record<string, any>) => void;
  }
>;
