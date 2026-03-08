import ErrorView from './500';
import withAnalytics from 'modules/Analytics/withAnalytics';
import { connect } from 'react-redux';
import { flowRight } from 'lodash-es';
import { setHasHero } from 'state/Hero/actions';

export default flowRight(
  connect(null, { setHasHero }),
  withAnalytics({ pageName: 'error_page' }),
)(ErrorView);
