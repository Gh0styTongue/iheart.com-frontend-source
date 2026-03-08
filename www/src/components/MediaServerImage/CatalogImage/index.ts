import CatalogImage from './CatalogImage';
import { connect } from 'react-redux';
import { createStructuredSelector } from 'reselect';
import { getAppMounted } from 'state/UI/selectors';
import { getMediaServerUrl, getSiteUrl } from 'state/Config/selectors';
import { getStationLogoByIdIfLive } from './selectors';
import type { State } from 'state/types';

export default connect(
  createStructuredSelector<
    State,
    { src?: string },
    {
      appMounted: boolean;
      mediaServerUrl: string;
      siteUrl: string;
      src: string;
    }
  >({
    appMounted: getAppMounted,
    mediaServerUrl: getMediaServerUrl,
    siteUrl: getSiteUrl,
    src: getStationLogoByIdIfLive,
  }),
)(CatalogImage);
