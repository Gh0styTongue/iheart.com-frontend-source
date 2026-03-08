import LiveDescription from 'components/LiveDescription';
import { connect } from 'react-redux';
import { createStructuredSelector } from 'reselect';
import { getStationDescriptionById } from 'state/Live/selectors';
import { State } from 'state/types';

export default connect(
  createStructuredSelector<
    State,
    { stationId: number | string },
    { text: string }
  >({
    text: getStationDescriptionById,
  }),
)(LiveDescription);
