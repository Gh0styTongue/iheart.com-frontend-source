import AlbumOverflow from './AlbumOverflow';
import ArtistOverflow from './ArtistOverflow';
import LiveOverflow from './LiveOverflow';
import MyMusicOverflow from './MyMusicOverflow';
import PlaylistOverflow from './PlaylistOverflow';
import PodcastOverflow from './PodcastOverflow';
import { StationType } from '../types';

const ControlSets = {
  [StationType.Album]: AlbumOverflow,
  [StationType.Artist]: ArtistOverflow,
  [StationType.Episode]: PodcastOverflow,
  [StationType.Favorites]: ArtistOverflow,
  [StationType.Live]: LiveOverflow,
  [StationType.MyMusic]: MyMusicOverflow,
  [StationType.Playlist]: PlaylistOverflow,
  [StationType.PlaylistRadio]: PlaylistOverflow,
  [StationType.Podcast]: PodcastOverflow,
  [StationType.Track]: ArtistOverflow,
};

export default ControlSets;
