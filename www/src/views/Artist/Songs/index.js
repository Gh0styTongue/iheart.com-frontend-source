import loadable from '@loadable/component';
import withAnalytics from 'modules/Analytics/withAnalytics';
import { compose } from 'redux';
import { connect } from 'react-redux';
import { createStructuredSelector } from 'reselect';
import { getAsyncData, pageInfo } from './statics';
import {
  getCurrentArtistId,
  getCurrentArtistName,
  getCurrentArtistTopTracks,
} from 'state/Artists/selectors';
import { getCurrentPath } from 'state/Routing/selectors';

const ArtistSongs = loadable(() => import('./ArtistSongs'));

ArtistSongs.getAsyncData = getAsyncData;
ArtistSongs.pageInfo = pageInfo;

const mapStateToProps = createStructuredSelector({
  artistId: getCurrentArtistId,
  artistName: getCurrentArtistName,
  tracks: getCurrentArtistTopTracks,
  url: getCurrentPath,
});

const getAnalyticsData = ({ artistId, artistName }) => ({
  id: `artist|${artistId}`,
  name: artistName,
  pageName: 'artist_top_songs',
});

export default compose(
  connect(mapStateToProps),
  withAnalytics(getAnalyticsData, {
    trackOnWillMount: ({ artistId }) => !artistId,
  }),
)(ArtistSongs);
