import UpgradeHero from './UpgradeHero';
import { connect } from 'react-redux';
import { setHasHero } from 'state/Hero/actions';

export default connect(null, { setHasHero })(UpgradeHero);
