import loadable from '@loadable/component';
import { connect } from 'react-redux';
import { createStructuredSelector } from 'reselect';
import { getRecurly } from 'state/Config/selectors';
import { getUserInvoices } from 'state/User/selectors';
import { navigate } from 'state/Routing/actions';
import { pageInfo } from './statics';
import { requestRecurlyHistory } from 'state/Profile/actions';
import { ViewWithStatics } from 'views/ViewWithStatics';

import type { ConnectedProps } from './RecurlyHistory';
import type { State } from 'state/types';

const RecurlyHistory = loadable(
  () => import('./RecurlyHistory'),
) as ViewWithStatics;

RecurlyHistory.pageInfo = pageInfo;

export default connect(
  createStructuredSelector<State, ConnectedProps>({
    invoices: getUserInvoices,
    recurlyKey: getRecurly,
  }),
  {
    navigate,
    requestRecurlyHistory,
  },
)(RecurlyHistory);
