import loadable from '@loadable/component';
import withAnalytics from 'modules/Analytics/withAnalytics';
import {
  adFreeSelector,
  myMusicLibrarySelector,
  subInfoLoadedSelector,
} from 'state/Entitlements/selectors';
import { compose } from 'redux';
import { connect } from 'react-redux';
import { createStructuredSelector } from 'reselect';
import { getAsyncData, pageInfo } from './statics';
import { getCountryCode } from 'state/Config/selectors';
import {
  getInternationalPlaylistRadioEnabled,
  getOnDemandEnabled,
} from 'state/Features/selectors';
import { getSection } from 'state/Routing/selectors';
import { navigate } from 'state/Routing/actions';

const YourLibrary = loadable(() => import('./YourLibrary'));

YourLibrary.getAsyncData = getAsyncData;
YourLibrary.pageInfo = pageInfo;

export default compose(
  connect(
    createStructuredSelector({
      adFree: adFreeSelector,
      countryCode: getCountryCode,
      internationalPlaylistRadioEnabled: getInternationalPlaylistRadioEnabled,
      myMusicLibrary: myMusicLibrarySelector,
      onDemandEnabled: getOnDemandEnabled,
      section: getSection,
      subInfoLoaded: subInfoLoadedSelector,
    }),
    { navigate },
  ),
  withAnalytics(props => ({
    filterName: props?.section.replace(/-/g, '_') || 'default',
    filterType: 'your_library_nav',
    pageName: 'your_library',
  })),
)(YourLibrary);
