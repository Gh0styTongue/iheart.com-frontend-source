import Legal, { Props } from './Legal';
import { connect } from 'react-redux';
import { createStructuredSelector } from 'reselect';
import { getLegalLinks } from 'state/Live/selectors';
import { showLiveLegalLinks } from 'state/Features/selectors';
import type { State } from 'state/types';

export default connect(
  createStructuredSelector<State, Props>({
    legalLinks: getLegalLinks,
    showLegalLinks: showLiveLegalLinks,
  }),
)(Legal);
