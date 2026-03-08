import GenreDirectory from 'views/Genre/GenreDirectory';
import GenreGame from 'views/Genre/GenreGame';
import GenrePage from 'views/Genre/GenrePage';
import paths from './paths';
import { getGenrePath } from 'state/Genres/selectors';

export default [
  {
    component: GenreDirectory,
    exact: true,
    path: paths.genre.directory,
  },
  {
    component: GenrePage,
    exact: true,
    path: paths.genre.profile,
    pathCorrection: getGenrePath,
  },
  {
    component: GenreGame,
    exact: true,
    path: paths.genre.game,
  },
];
