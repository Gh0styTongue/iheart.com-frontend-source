import BottomFixed from './BottomFixed';
import { compose } from 'redux';
import { connect } from 'react-redux';
import { createStructuredSelector } from 'reselect';
import { getAppMounted, getIsSearchOpen, getModal } from 'state/UI/selectors';
import type { ConnectedProps, OwnProps } from './BottomFixed';
import type { FunctionComponent } from 'react';
import type { State } from 'state/types';

export default compose<FunctionComponent<OwnProps>>(
  connect(
    createStructuredSelector<State, ConnectedProps>({
      appMounted: getAppMounted,
      modalOpen: (state: State) => Boolean(getModal(state)?.id),
      isSearchOpen: getIsSearchOpen,
    }),
  ),
)(BottomFixed);
