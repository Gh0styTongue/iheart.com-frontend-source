import PlaylistImage from './PlaylistImage';
import { connect } from 'react-redux';
import { createStructuredSelector } from 'reselect';
import { getMediaServerUrl, getSiteUrl } from 'state/Config/selectors';

export default connect(
  createStructuredSelector({
    mediaServerUrl: getMediaServerUrl,
    siteUrl: getSiteUrl,
  }),
)(PlaylistImage);
