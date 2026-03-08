import loadable from '@loadable/component';
import { localize } from 'redux-i18n';

const AlexaLinkIOS = loadable(() => import('./AlexaLinkIOS'));

export default localize('translate')(AlexaLinkIOS);
