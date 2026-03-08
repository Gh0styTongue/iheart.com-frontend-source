import paths from './paths';
import YourLibrary from 'views/YourLibrary';

export default [
  {
    component: YourLibrary,
    exact: true,
    path: paths.yourLibrary.index,
  },
  {
    component: YourLibrary,
    exact: true,
    path: paths.yourLibrary.recentlyPlayed,
  },
  {
    component: YourLibrary,
    exact: true,
    path: paths.yourLibrary.savedStations,
  },
  {
    component: YourLibrary,
    exact: true,
    path: paths.yourLibrary.podcasts,
  },
  {
    component: YourLibrary,
    exact: true,
    path: paths.yourLibrary.playlists,
  },
  {
    component: YourLibrary,
    exact: true,
    path: paths.yourLibrary.artists,
  },
  {
    component: YourLibrary,
    exact: true,
    path: paths.yourLibrary.artistProfile,
  },
  {
    component: YourLibrary,
    exact: true,
    path: paths.yourLibrary.albums,
  },
  {
    component: YourLibrary,
    exact: true,
    path: paths.yourLibrary.albumProfile,
  },
  {
    component: YourLibrary,
    env: ['dev', 'sandbox', 'master', 'beta'],
    exact: true,
    path: paths.yourLibrary.songs,
  },
];
