import loadable from '@loadable/component';
import withAnalytics from 'modules/Analytics/withAnalytics';
import { AlertContexts, ConnectedModals } from 'state/UI/constants';
import { compose } from 'redux';
import { connect } from 'react-redux';
import { createStructuredSelector } from 'reselect';
import { getAmpUrl } from 'state/Config/selectors';
import {
  getIsAnonymous,
  getProfileId,
  getSessionId,
} from 'state/Session/selectors';
import { getIsFamilyPlanChild, getSource } from 'state/Entitlements/selectors';
import { getQueryParams } from 'state/Routing/selectors';
import { localize } from 'redux-i18n';
import { openModal, openSignupModal } from 'state/UI/actions';

const FamilyPlanValidation = loadable(() => import('./FamilyPlanValidation'));

export default compose(
  localize('translate'),
  connect(
    createStructuredSelector({
      ampUrl: getAmpUrl,
      isAnonymous: getIsAnonymous,
      isFamilyPlanChild: getIsFamilyPlanChild,
      profileId: getProfileId,
      queryParam: getQueryParams,
      sessionId: getSessionId,
      source: getSource,
    }),
    {
      openSignup: () => openSignupModal({ context: 'family_plan_validation' }),
      openFailureModal: () =>
        openModal({
          id: ConnectedModals.Alert,
          context: AlertContexts.FamilyPlanFailure,
        }),
      openSuccessModal: () =>
        openModal({
          id: ConnectedModals.Alert,
          context: AlertContexts.FamilyPlanSuccess,
        }),
    },
  ),
  withAnalytics({ pageName: 'family_validation' }),
)(FamilyPlanValidation);
