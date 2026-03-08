import Footer from './Footer';
import { connect } from 'react-redux';
import { State } from 'state/types';

export default connect((state: State) => ({
  miniFooter: state?.features?.flags?.miniFooter ?? false,
  piiDashboardLink:
    state?.config?.piiRegulation?.dashboardLink ?? 'https://privacy.iheart.com',
  piiRegulationEnabled: state?.config?.piiRegulation?.enabled ?? false,
}))(Footer);
