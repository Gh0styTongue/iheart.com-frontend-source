import loadable from '@loadable/component';
import withAnalytics from 'modules/Analytics/withAnalytics';
import { compose } from 'redux';
import { connect } from 'react-redux';
import { createStructuredSelector } from 'reselect';
import { getAsyncData, pageInfo } from './statics';
import {
  getCurrentArtistId,
  getCurrentArtistName,
} from 'state/Artists/selectors';
import { getCurrentPath } from 'state/Routing/selectors';
import {
  getCurrentTrackId,
  getCurrentTrackTitle,
} from 'state/Tracks/selectors';

const SongView = loadable(() => import('./Song'));

SongView.getAsyncData = getAsyncData;
SongView.pageInfo = pageInfo;

export default compose(
  connect(
    createStructuredSelector({
      artistId: getCurrentArtistId,
      artistName: getCurrentArtistName,
      title: getCurrentTrackTitle,
      trackId: getCurrentTrackId,
      url: getCurrentPath,
    }),
  ),
  withAnalytics(
    ({ artistId, artistName, trackId, title }) => ({
      id: `artist|${artistId}`,
      name: artistName,
      pageName: 'song_profile',
      subId: `song|${trackId}`,
      subName: title,
    }),
    {
      trackOnDidUpdate: (prevProps, nextProps) =>
        !!nextProps.trackId &&
        String(prevProps.trackId) !== String(nextProps.trackId),
      trackOnWillMount: nextProps => !!nextProps.trackId,
    },
  ),
)(SongView);
