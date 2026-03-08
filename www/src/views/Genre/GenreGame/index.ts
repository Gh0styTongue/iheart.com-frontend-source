import loadable from '@loadable/component';
import { getAsyncData } from './statics';
import type { ViewWithStatics } from 'views/ViewWithStatics';

const GenreGame: ViewWithStatics = loadable(() => import('./GenreGame'));

GenreGame.getAsyncData = getAsyncData;

export default GenreGame;
