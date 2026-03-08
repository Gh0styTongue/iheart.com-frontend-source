import loadable from '@loadable/component';
import saveAlbum from 'state/YourLibrary/saveAlbum';
import withAnalytics from 'modules/Analytics/withAnalytics';
import { addAlbumToPlaylist } from 'state/Playlist/actions';
import { compose } from 'redux';
import { connect } from 'react-redux';
import { createStructuredSelector } from 'reselect';
import {
  getAllAccessPreview,
  showSaveAlbumHeaderOverflowSelector,
} from 'state/Entitlements/selectors';
import { getAsyncData, pageInfo } from './statics';
import { getCountryCode, getStationSoftgate } from 'state/Config/selectors';
import {
  getCurrentAlbumCopyright,
  getCurrentAlbumId,
  getCurrentAlbumPublisher,
  getCurrentAlbumTitle,
  getCurrentAlbumTracks,
} from 'state/Albums/selectors';
import {
  getCurrentArtistId,
  getCurrentArtistName,
} from 'state/Artists/selectors';
import {
  getInternationalPlaylistRadioEnabled,
  getOnDemandEnabled,
} from 'state/Features/selectors';
import { getIsAnonymous, getIsLoggedOut } from 'state/Session/selectors';
import { localize } from 'redux-i18n';
import {
  openSignupModal,
  openUpsellModal,
  showNotifyGrowl,
} from 'state/UI/actions';

const Album = loadable(() => import('./Album'));

Album.getAsyncData = getAsyncData;
Album.pageInfo = pageInfo;

export default compose(
  localize('translate'),
  connect(
    createStructuredSelector({
      albumId: getCurrentAlbumId,
      allAccessPreview: getAllAccessPreview,
      artistId: getCurrentArtistId,
      artistName: getCurrentArtistName,
      copyright: getCurrentAlbumCopyright,
      countryCode: getCountryCode,
      isAnonymous: getIsAnonymous,
      isLoggedOut: getIsLoggedOut,
      onDemandEnabled: getOnDemandEnabled,
      isInternationalPlaylistRadioEnabled: getInternationalPlaylistRadioEnabled,
      publisher: getCurrentAlbumPublisher,
      showSaveAlbumHeaderOverflow: showSaveAlbumHeaderOverflowSelector,
      stationSoftgate: getStationSoftgate,
      title: getCurrentAlbumTitle,
      tracks: getCurrentAlbumTracks,
    }),
    {
      addAlbumToPlaylist,
      saveAlbum: saveAlbum.action,
      openSignup: context => openSignupModal({ context }),
      openUpsellModal,
      showNotifyGrowl,
    },
  ),
  withAnalytics(
    ({ artistId, artistName }) => ({
      id: `artist|${artistId}`,
      name: artistName,
      pageName: 'artist_albums',
    }),
    {
      trackOnDidUpdate: (prevProps, nextProps) =>
        nextProps.albumId ? prevProps.albumId !== nextProps.albumId : false,
      trackOnWillMount: nextProps => !!nextProps.albumId,
    },
  ),
)(Album);
