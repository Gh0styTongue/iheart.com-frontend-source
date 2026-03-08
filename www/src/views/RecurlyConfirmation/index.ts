import loadable from '@loadable/component';
import { connect } from 'react-redux';
import { get } from 'lodash-es';
import { State } from 'state/Config/types';
import { ViewWithStatics } from 'views/ViewWithStatics';

const RecurlyConfirmation = loadable(
  () => import('./RecurlyConfirmation'),
) as ViewWithStatics;

const mapStateToProps = (state: State) => {
  const isTrial: boolean = get(
    state,
    'user.subscription.subInfo.isTrial',
    false,
  );
  const subscription: string = get(
    state,
    'user.subscription.subInfo.subscriptionType',
    'NONE',
  );

  return {
    isTrial,
    subscription,
  };
};

export default connect(mapStateToProps, {})(RecurlyConfirmation);
