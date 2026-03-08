import Loader from './Loader';
import { connect } from 'react-redux';
import { createStructuredSelector } from 'reselect';
import { getMediaServerUrl } from 'state/Config/selectors';

const mapStateToProps = createStructuredSelector({
  mediaServerUrl: getMediaServerUrl,
});

export default connect(mapStateToProps)(Loader);
