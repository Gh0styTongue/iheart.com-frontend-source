import loadable from '@loadable/component';
import withAnalytics from 'modules/Analytics/withAnalytics';
import { compose } from 'redux';
import { connect } from 'react-redux';
import { ConnectedModals } from 'state/UI/constants';
import { createStructuredSelector } from 'reselect';
import { getAsyncData } from 'views/Welcome/statics';
import { getCurrentPath, getSearchQuery } from 'state/Routing/selectors';
import { getIsAnonymous } from 'state/Session/selectors';
import { openModal } from 'state/UI/actions';
import { setSearchQuery } from 'state/Search/actions';

const HomeView = loadable(() => import('./Home'));

HomeView.getAsyncData = getAsyncData;

export default compose(
  connect(
    createStructuredSelector({
      isAnonymous: getIsAnonymous,
      path: getCurrentPath,
      searchQueryFromQS: getSearchQuery,
    }),
    {
      openSearch: () =>
        openModal({ id: ConnectedModals.Search, context: null }),
      setSearchQuery,
    },
  ),
  withAnalytics({ pageName: 'for_you' }),
)(HomeView);
