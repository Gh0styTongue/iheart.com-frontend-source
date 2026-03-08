import loadable from '@loadable/component';
import { connect } from 'react-redux';
import { createStructuredSelector } from 'reselect';
import {
  getAppLinks,
  getInfoLinks,
  getNavLinks,
  getSocialLinks,
} from './selectors';
import { getCustomRadioEnabled } from 'state/Features/selectors';
import { getPrivacyLink, getTermsLink } from 'state/Links/selectors';
import { Props } from './FullFooter';
import { showPlaylistSelector } from 'state/Entitlements/selectors';
import { State } from 'state/buildInitialState';

const Footer = loadable(() => import('./FullFooter'));

export default connect(
  createStructuredSelector<
    State,
    {
      appLinks: Props['appLinks'];
      customRadioEnabled: boolean;
      infoLinks: Props['infoLinks'];
      navLinks: Props['navLinks'];
      privacy: string;
      showPlaylist: boolean;
      socialLinks: Props['socialLinks'];
      terms: string;
    }
  >({
    appLinks: getAppLinks,
    customRadioEnabled: getCustomRadioEnabled,
    infoLinks: getInfoLinks,
    navLinks: getNavLinks,
    privacy: getPrivacyLink,
    showPlaylist: showPlaylistSelector,
    socialLinks: getSocialLinks,
    terms: getTermsLink,
  }),
)(Footer);
