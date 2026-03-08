import loadable from '@loadable/component';
import { getAsyncData } from './statics';
import { ViewWithStatics } from 'views/ViewWithStatics';

const ContentArticle = loadable(() => import('./Legacy')) as ViewWithStatics;

ContentArticle.getAsyncData = getAsyncData;

export default ContentArticle;
