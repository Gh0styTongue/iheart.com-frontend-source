import Dropdown from './Dropdown';
import { connect } from 'react-redux';
import { createStructuredSelector } from 'reselect';
import {
  deleteFromListenHistory,
  toggleStationSaved,
} from 'state/Stations/actions';
import { deleteRecByTypeAndId } from 'state/Recs/actions';
import { getIsAnonymous } from 'state/Session/selectors';
import { getLiveStations } from 'state/Live/selectors';
import { LiveStation } from 'state/Live/types';
import { State } from 'state/types';

type ConnectedProps = {
  isAnonymous: boolean;
  stations: {
    [id: string]: LiveStation;
  };
};

export default connect(
  createStructuredSelector<State, ConnectedProps>({
    isAnonymous: getIsAnonymous,
    stations: getLiveStations,
  }),
  { deleteFromListenHistory, toggleStationSaved, deleteRecByTypeAndId },
)(Dropdown);
