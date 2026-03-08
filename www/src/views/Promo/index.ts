import loadable from '@loadable/component';
import { getAsyncData, pageInfo } from './statics';
import type { ViewWithStatics } from 'views/ViewWithStatics';

const Promo: ViewWithStatics = loadable(() => import('./Promo'));

Promo.getAsyncData = getAsyncData;
Promo.pageInfo = pageInfo;

export default Promo;
