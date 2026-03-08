import loadable from '@loadable/component';
import { localize } from 'redux-i18n';

const MetaWearablesLink = loadable(() => import('./MetaWearablesLink'));

export default localize('translate')(MetaWearablesLink);
