import loadable from '@loadable/component';
import { getAsyncData, pageInfo } from './statics';
import type { ViewWithStatics } from 'views/ViewWithStatics';

const PlaylistDirectory = loadable(
  () => import('./PlaylistDirectory'),
) as ViewWithStatics;

PlaylistDirectory.getAsyncData = getAsyncData;
PlaylistDirectory.pageInfo = pageInfo;

export default PlaylistDirectory;
