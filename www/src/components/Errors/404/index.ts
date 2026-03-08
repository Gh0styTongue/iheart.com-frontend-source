import PageNotFound from './404';
import withAnalytics from 'modules/Analytics/withAnalytics';
import { connect } from 'react-redux';
import { createStructuredSelector } from 'reselect';
import { flowRight } from 'lodash-es';
import { getForce404data } from 'state/Routing/selectors';
import { setForce404data } from 'state/Routing/actions';
import { setHasHero } from 'state/Hero/actions';
import type { State as RoutingState } from 'state/Routing/types';
import type { State } from 'state/buildInitialState';
import type { ViewWithStatics } from 'views/ViewWithStatics';

type Props = {
  force404data: RoutingState['force404data'];
};

(PageNotFound as ViewWithStatics).pageInfo = () => ({
  pageId: 404,
  pageType: '404page',
  status: 404,
  targeting: {
    name: '404page',
  },
});

export default flowRight(
  connect(
    createStructuredSelector<State, Props>({
      force404data: getForce404data,
    }),
    { setForce404data, setHasHero },
  ),
  withAnalytics({ pageName: 'error_page' }),
)(PageNotFound);
