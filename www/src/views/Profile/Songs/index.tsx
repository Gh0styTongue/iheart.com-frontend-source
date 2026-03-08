import loadable from '@loadable/component';
import withAnalytics from 'modules/Analytics/withAnalytics';
import { connect } from 'react-redux';
import { createStructuredSelector } from 'reselect';
import { flowRight } from 'lodash-es';
import { getProfileId } from 'state/Session/selectors';
import { pageInfo } from './statics';
import { Props } from './Songs';
import { setHasHero } from 'state/Hero/actions';
import { State } from 'state/types';
import { ViewWithStatics } from 'views/ViewWithStatics';

const Songs = loadable(() => import('./Songs')) as ViewWithStatics;

Songs.pageInfo = pageInfo;

const mapStateToProps = createStructuredSelector<
  State,
  Pick<Props, 'profileId'>
>({
  profileId: getProfileId,
});

export default flowRight(
  connect(mapStateToProps, { setHasHero }),
  withAnalytics(() => ({ pageName: 'saved_stations' })),
)(Songs);
