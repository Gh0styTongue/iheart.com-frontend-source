import loadable from '@loadable/component';
import withAnalytics from 'modules/Analytics/withAnalytics';
import { closeModal, openLoginModal } from 'state/UI/actions';
import { connect } from 'react-redux';
import { ConnectedModals } from 'state/UI/constants';
import { createStructuredSelector } from 'reselect';
import { flowRight } from 'lodash-es';
import { getIsAnonymous } from 'state/Session/selectors';
import { getModal } from 'state/UI/selectors';
import { navigate } from 'state/Routing/actions';
import { pageInfo } from './statics';
import { setHasHero } from 'state/Hero/actions';
import { State } from 'state/buildInitialState';
import { ViewWithStatics } from 'views/ViewWithStatics';

const Settings = loadable(() => import('./Settings')) as ViewWithStatics;

type ConnectedProps = {
  authModalIsOpen: boolean;
  isAnonymous: boolean;
};

Settings.pageInfo = pageInfo;

export default flowRight(
  connect(
    createStructuredSelector<State, ConnectedProps>({
      authModalIsOpen: state => getModal(state)?.id === ConnectedModals.Auth,
      isAnonymous: getIsAnonymous,
    }),
    { closeModal, navigate, openLoginModal, setHasHero },
  ),
  withAnalytics({ pageName: 'settings' }),
)(Settings);
