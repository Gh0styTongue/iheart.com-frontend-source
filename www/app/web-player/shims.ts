import AlbumStation from 'web-player/models/Album';
import CollectionStation from 'web-player/models/Collection';
import CustomStation from 'web-player/models/Custom';
import LiveStation from 'web-player/models/Live';
import MyMusicStation from 'web-player/models/MyMusic';
import PlaylistRadioStation from 'web-player/models/PlaylistRadio';
import PodcastStation from 'web-player/models/Podcast';
import { STATION_TYPE } from 'constants/stationTypes';

const typeToModel = {
  [STATION_TYPE.COLLECTION]: CollectionStation,
  [STATION_TYPE.PLAYLIST_RADIO]: PlaylistRadioStation,
  [STATION_TYPE.LIVE]: LiveStation,
  [STATION_TYPE.ARTIST]: CustomStation,
  [STATION_TYPE.FEATURED]: CustomStation,
  [STATION_TYPE.TRACK]: CustomStation,
  [STATION_TYPE.CUSTOM]: CustomStation,
  [STATION_TYPE.FAVORITES]: CustomStation,
  [STATION_TYPE.ALBUM]: AlbumStation,
  [STATION_TYPE.MY_MUSIC]: MyMusicStation,
  [STATION_TYPE.PODCAST]: PodcastStation,
};

export function getStationModel(type: string) {
  return typeToModel[type];
}
