import makePlaylistRedirect from 'views/Playlist/RedirectToPlaylist';
import paths from './paths';
import PlaylistDirectory from 'views/Playlist/PlaylistDirectory';
import PlaylistProfile from 'views/Playlist/PlaylistProfile';
import PlaylistSubDirectory from 'views/Playlist/PlaylistSubDirectory';
import { getCurrentCanonicalUrl } from 'state/Playlist/selectors';
import { getPlaylistDirectoryPath } from 'state/PlaylistDirectory/selectors';

export default [
  {
    component: makePlaylistRedirect({
      fallback: '/your-library/',
      playlistIdentifier: 'default',
    }),
    exact: true,
    path: paths.playlist.my,
  },
  {
    component: PlaylistProfile,
    exact: true,
    path: paths.playlist.profile,
    pathCorrection: getCurrentCanonicalUrl,
  },
  {
    component: makePlaylistRedirect({
      fallback: '/content/iheartradio-your-weekly-mixtape/',
      playlistIdentifier: 'new4u',
      byId: true,
    }),
    exact: true,
    path: paths.playlist.mixtape,
  },
  {
    component: makePlaylistRedirect({
      fallback: '/content/iheartradio-your-weekly-themed-playlists/',
      playlistIdentifier: 'chill4u',
      byId: true,
    }),
    exact: true,
    path: paths.playlist.chill,
  },
  {
    component: makePlaylistRedirect({
      fallback: '/content/iheartradio-your-weekly-themed-playlists/',
      playlistIdentifier: 'workout4u',
      byId: true,
    }),
    exact: true,
    path: paths.playlist.workout,
  },
  {
    component: PlaylistDirectory,
    exact: true,
    path: paths.playlist.directory,
  },
  {
    component: PlaylistSubDirectory,
    exact: true,
    path: paths.playlist.subDirectory,
    pathCorrection: getPlaylistDirectoryPath,
  },
];
