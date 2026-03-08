import MediaServerImage from './MediaServerImage';
import { connect } from 'react-redux';
import { createStructuredSelector } from 'reselect';
import { getMediaServerUrl, getSiteUrl } from 'state/Config/selectors';
import { State } from 'state/types';
import { THUMB_FIT, THUMB_RES, TILE_FIT, TILE_RES } from './constants';

export default connect(
  createStructuredSelector<State, { mediaServerUrl: string; siteUrl: string }>({
    mediaServerUrl: getMediaServerUrl,
    siteUrl: getSiteUrl,
  }),
)(MediaServerImage);

export { THUMB_FIT, THUMB_RES, TILE_FIT, TILE_RES };
