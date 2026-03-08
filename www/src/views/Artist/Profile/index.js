import loadable from '@loadable/component';
import saveAlbum from 'state/YourLibrary/saveAlbum';
import saveSongs from 'state/YourLibrary/saveSongs';
import withAnalytics from 'modules/Analytics/withAnalytics';
import {
  addAlbumToPlaylistSelector,
  addTrackToPlaylistSelector,
  editPlayableAsRadioSelector,
  getAllAccessPreview,
  playAlbumSelector,
  saveAlbumOverflowSelector,
  showAddTrackToPlaylistSelector,
  showAlbumHeaderSelector,
  trackOverflowSelector,
} from 'state/Entitlements/selectors';
import { compose } from 'redux';
import { connect } from 'react-redux';
import { ConnectedModals } from 'state/UI/constants';
import { createStructuredSelector } from 'reselect';
import { getAlbumsByCurrentArtist } from 'state/Albums/selectors';
import {
  getArtistPath,
  getCurrentArtistAdGenre,
  getCurrentArtistArticles,
  getCurrentArtistBio,
  getCurrentArtistId,
  getCurrentArtistLatestRelease,
  getCurrentArtistName,
  getCurrentArtistPopularOn,
  getCurrentArtistTopTracks,
  trackOverflowsSelector,
} from 'state/Artists/selectors';
import { getAsyncData, pageInfo } from './statics';
import { getContentLink } from 'state/Links/selectors';
import { getCustomRadioEnabled } from 'state/Features/selectors';
import { getIsAnonymous } from 'state/Session/selectors';
import { getStationLoaded } from 'state/Player/selectors';
import { localize } from 'redux-i18n';
import {
  openModal,
  openSignupModal,
  openUpsellModal,
  showNotifyGrowl,
} from 'state/UI/actions';
import { requestAlbum } from 'state/Albums/actions';

const ArtistProfile = loadable(() => import('./ArtistProfile'));

ArtistProfile.getAsyncData = getAsyncData;
ArtistProfile.pageInfo = pageInfo;

export default compose(
  localize('translate'),
  connect(
    createStructuredSelector({
      addAlbumToPlaylist: addAlbumToPlaylistSelector,
      albumPlayback: playAlbumSelector,
      albums: getAlbumsByCurrentArtist,
      allAccessPreview: getAllAccessPreview,
      articles: getCurrentArtistArticles,
      artistBio: getCurrentArtistBio,
      artistId: getCurrentArtistId,
      artistName: getCurrentArtistName,
      artistPopularOn: getCurrentArtistPopularOn,
      artistTopTracks: getCurrentArtistTopTracks,
      canAddTrackToPlaylist: addTrackToPlaylistSelector,
      canEditPlayableAsRadio: editPlayableAsRadioSelector,
      contentLink: getContentLink,
      customRadioEnabled: getCustomRadioEnabled,
      isAnonymous: getIsAnonymous,
      latestRelease: getCurrentArtistLatestRelease,
      overflowEntitlements: trackOverflowsSelector,
      saveAlbumOverflow: saveAlbumOverflowSelector,
      showAddTrackToPlaylist: showAddTrackToPlaylistSelector,
      showAlbumHeader: showAlbumHeaderSelector,
      showTrackOverflow: trackOverflowSelector,
      stationLoaded: getStationLoaded,
      url: getArtistPath,
      adGenre: getCurrentArtistAdGenre,
    }),
    {
      requestAlbum,
      openAddToPlaylist: ({ trackIds, view, component, type }) =>
        openModal({
          id: ConnectedModals.AddToPlaylist,
          context: { trackIds, view, component, type },
        }),
      openSignup: context => openSignupModal({ context }),
      openUpsellModal,
      saveAlbum: saveAlbum.action,
      saveSongs: saveSongs.action,
      showNotifyGrowl,
    },
  ),
  withAnalytics(
    ({ artistId, artistName, adGenre }) => ({
      id: `artist|${artistId}`,
      name: artistName,
      pageName: 'artist_profile',
      adGenre,
    }),
    {
      trackOnDidUpdate: (prevProps, nextProps) =>
        !!nextProps.adGenre &&
        String(prevProps.adGenre) !== String(nextProps.adGenre),
      trackOnWillMount: nextProps => !!nextProps.adGenre,
    },
  ),
)(ArtistProfile);
