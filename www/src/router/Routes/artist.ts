import ArtistAlbum from 'views/Artist/Album';
import ArtistAlbums from 'views/Artist/Albums';
import ArtistDirectory from 'views/Artist/ArtistDirectory';
import ArtistNews from 'views/Artist/News';
import ArtistProfile from 'views/Artist/Profile';
import ArtistSong from 'views/Artist/Song';
import ArtistSongs from 'views/Artist/Songs';
import paths from './paths';
import SimilarArtists from 'views/Artist/Similar';
import {
  getAlbumDirectoryPath,
  getArtistDirectoryPath,
  getArtistPath,
  getNewsPath,
  getSimilarArtistsPath,
  getSongDirectoryPath,
} from 'state/Artists/selectors';
import { getAlbumPath } from 'state/Albums/selectors';
import { getSongPath } from 'state/Tracks/selectors';

export default [
  {
    component: ArtistDirectory,
    exact: true,
    path: paths.artist.directory,
  },
  {
    component: ArtistDirectory,
    exact: true,
    path: paths.artist.genre,
    pathCorrection: getArtistDirectoryPath,
  },
  {
    component: ArtistProfile,
    exact: true,
    path: paths.artist.profile,
    pathCorrection: getArtistPath,
  },
  {
    component: ArtistSong,
    exact: true,
    path: paths.artist.song,
    pathCorrection: getSongPath,
  },
  {
    component: ArtistSongs,
    exact: true,
    path: paths.artist.songs,
    pathCorrection: getSongDirectoryPath,
  },
  {
    component: ArtistAlbum,
    exact: true,
    path: paths.artist.album,
    pathCorrection: getAlbumPath,
  },
  {
    component: ArtistAlbums,
    exact: true,
    path: paths.artist.albums,
    pathCorrection: getAlbumDirectoryPath,
  },
  {
    component: ArtistNews,
    exact: true,
    path: paths.artist.news,
    pathCorrection: getNewsPath,
  },
  {
    component: SimilarArtists,
    exact: true,
    path: paths.artist.similar,
    pathCorrection: getSimilarArtistsPath,
  },
];
