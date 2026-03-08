import Featuring from './Featuring';
import { compose } from 'redux';
import { connect } from 'react-redux';
import { createStructuredSelector } from 'reselect';
import { getAmpUrl } from 'state/Config/selectors';
import { localize } from 'redux-i18n';

export default compose(
  localize('translate'),
  connect(
    createStructuredSelector({
      ampUrl: getAmpUrl,
    }),
  ),
)(Featuring);
