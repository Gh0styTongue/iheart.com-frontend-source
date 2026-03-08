import AppBody from './AppBody';
import { appMounted } from 'state/UI/actions';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';

export default withRouter(connect('', { appMounted })(AppBody));
