import MiniFooter from './MiniFooter';
import { connect } from 'react-redux';
import { State } from 'state/types';

export default connect(({ links }: State) => ({
  help: links.help,
  privacy: links.privacy,
  terms: links.terms,
}))(MiniFooter);
