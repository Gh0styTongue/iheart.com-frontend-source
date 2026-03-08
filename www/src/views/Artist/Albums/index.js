import loadable from '@loadable/component';
import saveAlbum from 'state/YourLibrary/saveAlbum';
import withAnalytics from 'modules/Analytics/withAnalytics';
import { compose } from 'redux';
import { connect } from 'react-redux';
import { createStructuredSelector } from 'reselect';
import {
  getAlbumsByCurrentArtist,
  getNextAlbumsLinkByCurrentArtist,
} from 'state/Albums/selectors';
import { getAsyncData, pageInfo } from './statics';
import {
  getCurrentArtistId,
  getCurrentArtistName,
} from 'state/Artists/selectors';
import { getCurrentPath } from 'state/Routing/selectors';
import { getCustomRadioEnabled } from 'state/Features/selectors';
import { playAlbumSelector } from 'state/Entitlements/selectors';
import { requestAdditionalAlbums, requestAlbum } from 'state/Albums/actions';

const Albums = loadable(() => import('./Albums'));

Albums.getAsyncData = getAsyncData;
Albums.pageInfo = pageInfo;

export default compose(
  connect(
    createStructuredSelector({
      albumPlayback: playAlbumSelector,
      albums: getAlbumsByCurrentArtist,
      artistId: getCurrentArtistId,
      artistName: getCurrentArtistName,
      customRadioEnabled: getCustomRadioEnabled,
      nextAlbumLink: getNextAlbumsLinkByCurrentArtist,
      url: getCurrentPath,
    }),
    {
      requestAdditionalAlbums,
      requestAlbum,
      saveAlbum: saveAlbum.action,
    },
  ),
  withAnalytics(
    ({ artistId, artistName }) => ({
      id: `artist|${artistId}`,
      name: artistName,
      pageName: 'artist_top_songs',
    }),
    { trackOnWillMount: ({ artistId }) => !artistId },
  ),
)(Albums);
