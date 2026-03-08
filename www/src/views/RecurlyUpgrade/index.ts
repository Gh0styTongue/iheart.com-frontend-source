import loadable from '@loadable/component';
import withAnalytics from 'modules/Analytics/withAnalytics';
import { connect } from 'react-redux';
import { createStructuredSelector } from 'reselect';
import { flowRight } from 'lodash-es';
import {
  getAutoRenewing,
  getIsTrial,
  getIsTrialEligible,
  getSource,
  getSubscriptionType,
  subInfoLoadedSelector,
} from 'state/Entitlements/selectors';
import { getIsAnonymous, getProfileId } from 'state/Session/selectors';
import { getRecurly } from 'state/Config/selectors';
import { getRecurlySkus } from 'state/SiteData/actions';
import { getSearch } from 'state/Routing/selectors';
import { getTermsLink } from 'state/Links/selectors';
import { navigate } from 'state/Routing/actions';
import { openSignupModal, openTermsAndConditionsModal } from 'state/UI/actions';
import { pageInfo } from './statics';
import { recurlySkus } from 'state/SiteData/selectors';
import { RecurlySkus } from 'state/SiteData/types';
import { setHideHero } from 'state/Hero/actions';
import { State } from 'state/types';
import { SUBSCRIPTION_TYPE } from 'constants/subscriptionConstants';
import { ViewWithStatics } from 'views/ViewWithStatics';

type Selectors = {
  isTrial: boolean;
  isTrialEligible: boolean;
  recurly: string;
  recurlySkus: RecurlySkus;
  search: string;
  subInfoLoaded: boolean;
  termsLink: string;
  userId: number | null;
  userIsAutoRenewing: boolean;
  userSubSource: string;
  userSubType: keyof typeof SUBSCRIPTION_TYPE;
  isAnonymous: boolean;
};

const UpgradeRecurly = loadable(
  () => import('./RecurlyUpgrade'),
) as ViewWithStatics;

UpgradeRecurly.pageInfo = pageInfo;

export default flowRight(
  connect(
    createStructuredSelector<State, Selectors>({
      isTrial: getIsTrial,
      isTrialEligible: getIsTrialEligible,
      recurly: getRecurly,
      recurlySkus,
      search: getSearch,
      subInfoLoaded: subInfoLoadedSelector,
      termsLink: getTermsLink,
      userId: getProfileId,
      userIsAutoRenewing: getAutoRenewing,
      userSubSource: getSource,
      userSubType: getSubscriptionType,
      isAnonymous: getIsAnonymous,
    }),
    {
      getRecurlySkus,
      hideHero: setHideHero,
      navigate,
      openSignupModal,
      openTermsAndConditionsModal,
    },
  ),
  withAnalytics({ pageName: 'upgrade' }),
)(UpgradeRecurly);
