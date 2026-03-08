import NavLink from './NavLink';
import { connect } from 'react-redux';
import { createStructuredSelector } from 'reselect';
import { flowRight } from 'lodash-es';
import { getIsInApp } from 'state/Environment/selectors';
import { getSiteUrl } from 'state/Config/selectors';
import { navigate } from 'state/Routing/actions';
import { State } from 'state/types';

export default flowRight(
  connect(
    createStructuredSelector<State, { isInApp: boolean; siteUrl: string }>({
      isInApp: getIsInApp,
      siteUrl: getSiteUrl,
    }),
    { navigate },
  ),
)(NavLink);
