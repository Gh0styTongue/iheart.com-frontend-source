import reduxFactory from 'state/factory';
import { albumResolver } from './album';
import { artistResolver } from './artist';
import { favoritesResolver } from './favorites';
import { liveResolver } from './live';
import { myMusicAlbumResolver } from './myMusicAlbums';
import { myMusicArtistsResolver } from './myMusicArtists';
import { myMusicSongResolver } from './myMusicSong';
import { MyMusicSubType } from 'state/Playback/types';
import { playlistResolver } from './playlist';
import { podcastResolver } from './podcast';
import { STATION_TYPE, StationTypeValue } from 'constants/stationTypes';
import { trackResolver } from './track';

const store = reduxFactory();

const mapTypeToResolver = {
  [STATION_TYPE.ALBUM]: albumResolver,
  [STATION_TYPE.ARTIST]: artistResolver,
  [STATION_TYPE.COLLECTION]: playlistResolver,
  [STATION_TYPE.FAVORITES]: favoritesResolver,
  [STATION_TYPE.LIVE]: liveResolver,
  [STATION_TYPE.PLAYLIST_RADIO]: playlistResolver,
  [STATION_TYPE.PODCAST]: podcastResolver,
  [STATION_TYPE.TRACK]: trackResolver,
};

const mapMyMusicTypeToResolver = {
  [STATION_TYPE.ALBUM]: myMusicAlbumResolver,
  [STATION_TYPE.ARTIST]: myMusicArtistsResolver,
  [STATION_TYPE.SONG]: myMusicSongResolver,
};

export type ResolveStationParams = {
  myMusicType?: MyMusicSubType;
  partialLoad: boolean;
  playedFrom: number | string;
  stationId: number | string;
  stationType: StationTypeValue;
  trackId?: number;
};

export default function resolveStation({
  myMusicType,
  partialLoad,
  playedFrom,
  stationId,
  stationType,
  trackId,
}: ResolveStationParams): Promise<{
  [a: string]: any;
}> {
  let resolver;

  resolver = mapTypeToResolver[stationType];

  if (!resolver && myMusicType)
    resolver = mapMyMusicTypeToResolver[myMusicType];

  return resolver({
    partialLoad,
    playedFrom: String(playedFrom),
    stationId,
    stationType,
    store,
    trackId,
  });
}
