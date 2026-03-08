import loadable from '@loadable/component';
import withAnalytics from 'modules/Analytics/withAnalytics';
import { connect } from 'react-redux';
import { flowRight } from 'lodash-es';
import { getAsyncData } from './statics';
import { structuredNetworksSelector } from 'state/Podcast/selectors';
import type { ViewWithStatics } from 'views/ViewWithStatics';

const NetworkDirectory = loadable(
  () => import('./NetworkDirectory'),
) as ViewWithStatics;

NetworkDirectory.getAsyncData = getAsyncData;

export default flowRight(
  connect(structuredNetworksSelector),
  withAnalytics({
    filterName: 'View All',
    filterType: 'Podcast Network',
    pageName: 'podcast_directory',
  }),
)(NetworkDirectory);
