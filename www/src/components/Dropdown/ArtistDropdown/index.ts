import Dropdown from './Dropdown';
import { connect } from 'react-redux';
import { createStructuredSelector } from 'reselect';
import {
  deleteFromListenHistory,
  toggleStationSaved,
} from 'state/Stations/actions';
import { deleteRecByTypeAndId } from 'state/Recs/actions';
import { flowRight } from 'lodash-es';
import { getIsAnonymous } from 'state/Session/selectors';
import { State } from 'state/types';

type ConnectedProps = {
  isAnonymous: boolean;
};

export default flowRight(
  connect(
    createStructuredSelector<State, ConnectedProps>({
      isAnonymous: getIsAnonymous,
    }),
    {
      deleteFromListenHistory,
      toggleStationSaved,
      deleteRecByTypeAndId,
    },
  ),
)(Dropdown);
