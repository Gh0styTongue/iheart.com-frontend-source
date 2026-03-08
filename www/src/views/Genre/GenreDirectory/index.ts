import loadable from '@loadable/component';
import { getAsyncData, pageInfo } from './statics';
import { ViewWithStatics } from 'views/ViewWithStatics';

const GenreDirectory: ViewWithStatics = loadable(
  () => import('./GenreDirectory'),
);

GenreDirectory.getAsyncData = getAsyncData;
GenreDirectory.pageInfo = pageInfo;

export default GenreDirectory;
