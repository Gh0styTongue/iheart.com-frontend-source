import LiveDirectory from 'views/Live/LiveDirectory';
import LiveProfile from 'views/Live/LiveProfile';
import paths from './paths';
import { getLiveDirectoryPath, getLiveStationPath } from 'state/Live/selectors';

export default [
  {
    component: LiveDirectory,
    exact: true,
    path: paths.live.directory,
  },
  {
    component: LiveDirectory,
    exact: true,
    path: paths.live.country,
    pathCorrection: getLiveDirectoryPath,
  },
  {
    component: LiveDirectory,
    exact: true,
    path: paths.live.city,
    pathCorrection: getLiveDirectoryPath,
  },
  {
    component: LiveProfile,
    exact: true,
    path: paths.live.highlights,
  },
  {
    component: LiveProfile,
    exact: true,
    path: paths.live.profile,
    pathCorrection: getLiveStationPath,
  },
];
