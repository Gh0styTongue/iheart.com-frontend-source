import Dropdown from './Dropdown';
import { connect } from 'react-redux';
import {
  deleteFromListenHistory,
  toggleStationSaved,
} from 'state/Stations/actions';
import { flowRight } from 'lodash-es';

export default flowRight(
  connect(null, { deleteFromListenHistory, toggleStationSaved }),
)(Dropdown);
