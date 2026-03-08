import Redirect from './Redirect';
import { connect } from 'react-redux';
import { createStructuredSelector } from 'reselect';
import { getSearch } from 'state/Routing/selectors';
import { navigate } from 'state/Routing/actions';

export default connect(createStructuredSelector({ search: getSearch }), {
  navigate,
})(Redirect);
