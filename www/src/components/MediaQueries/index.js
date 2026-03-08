import MediaQueries from './MediaQueries';
import MediaQueriesToProps from './MediaQueriesToProps';
import { connect } from 'react-redux';
import { createStructuredSelector } from 'reselect';
import { getAppMounted } from 'state/UI/selectors';

const WrappedMediaQueriesToProps = connect(
  createStructuredSelector({
    appMounted: getAppMounted,
  }),
)(MediaQueriesToProps);

export { MediaQueries, WrappedMediaQueriesToProps as MediaQueriesToProps };
