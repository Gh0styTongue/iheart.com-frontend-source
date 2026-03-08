import Copyright from './Copyright';
import { connect } from 'react-redux';
import { createStructuredSelector } from 'reselect';
import { getAdChoicesLink } from 'state/Links/selectors';
import { State } from 'state/buildInitialState';

export default connect(
  createStructuredSelector<State, { adChoicesLink: string }>({
    adChoicesLink: getAdChoicesLink,
  }),
)(Copyright);
