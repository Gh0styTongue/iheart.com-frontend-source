import AlbumControls from './AlbumControls';
import ArtistControls from './ArtistControls';
import FavoritesControls from './FavoritesControls';
import LiveControls from './LiveControls';
import MyMusicControls from './MyMusicControls';
import PlaylistControls from './PlaylistControls';
import PlaylistRadioControls from './PlaylistRadioControls';
import PodcastControls from './PodcastControls';
import { StationType } from '../types';

const ControlSets = {
  [StationType.Album]: AlbumControls,
  [StationType.Artist]: ArtistControls,
  [StationType.Episode]: PodcastControls,
  [StationType.Favorites]: FavoritesControls,
  [StationType.Live]: LiveControls,
  [StationType.MyMusic]: MyMusicControls,
  [StationType.Playlist]: PlaylistControls,
  [StationType.PlaylistRadio]: PlaylistRadioControls,
  [StationType.Podcast]: PodcastControls,
  [StationType.Track]: ArtistControls,
};

export default ControlSets;
