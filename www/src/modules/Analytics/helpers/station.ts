import logger, { CONTEXTS } from 'modules/Logger';
import PlaylistTypes from 'constants/playlistTypes';
import safeStringify from 'utils/safeStringify';
import { AtLeastOneRequired } from 'types/utilityTypes';
import { composeEventData, namespace, property } from '../factories';
import { decodePlaylistSeedId } from 'state/Playlist/helpers';
import { STATION_TYPE } from 'constants/stationTypes';
import type { CurrentPlaylistType } from 'state/Playlist/types';

export type Asset = {
  id: string;
  name: string;
  sub?: {
    id: string;
    name: string;
  };
};

export type StationAsset = {
  asset: Asset;
  sessionId?: string;
  playedFrom?: number;
};

export type Station = {
  station: StationAsset;
};

export type AlbumInput = Readonly<{
  type: 'album';
  artistId: number | string;
  artistName: string;
  id: number | string;
  name: string;
  trackArtistId?: number | string;
  trackArtistName?: string;
  trackId?: string | number;
  trackName?: string;
}>;

export type ArtistInput = Readonly<{
  type: 'artist';
  id: number | string;
  trackArtistId?: number | string;
  trackArtistName?: string;
  trackId?: string | number;
  trackName?: string;
}> &
  AtLeastOneRequired<{
    artistName: string;
    name: string;
  }>;

export type CollectionShape = {
  curated: boolean;
  type: CurrentPlaylistType;
} & AtLeastOneRequired<{
  userId: number | string | null;
  ownerId: number | string | null;
}> &
  AtLeastOneRequired<{
    id: string;
    playlistId: string;
    reportingKey: string;
  }>;

export type CollectionInput = Readonly<{
  type: 'collection';
  name: string;
  collection?: CollectionShape | Record<string, undefined>;
  profileId: string | number;
  trackArtistId?: number | string;
  trackArtistName?: string;
  trackId?: string | number;
  trackName?: string;
  id?: string; // used elsewhere
}>;

export type PlaylistRadioInput = Readonly<{
  name: string;
  type: 'playlistradio';
  collection?: CollectionShape | Record<string, undefined>;
  trackArtistId?: number | string;
  trackArtistName?: string;
  trackId?: string | number;
  trackName?: string;
  id?: string; // used elsewhere
}>;

export type MyPlaylistInput = Readonly<{
  name: string;
  type: 'my_playlist';
  collection: CollectionShape;
  trackArtistId?: number | string;
  trackArtistName?: string;
  trackId?: string | number;
  trackName?: string;
  id?: string; // used elsewhere
}>;

export type MFRInput = Readonly<{
  type: 'favorites';
  id: string | number;
  profileId: string | number;
  name: string;
}>;

export type LiveInput = Readonly<{
  id: string | number;
  name: string;
  fallbackErrorCode?: number;
  fallbackErrorDescription?: string;
  type: 'live';
}>;

export type MyMusicInput = Readonly<{
  profileId: string | number;
  type: 'mymusic';
  trackArtistId?: number | string;
  trackArtistName?: string;
  trackId?: string | number;
  trackName?: string;
}>;

export type PodcastInput = Readonly<{
  id: string | number;
  type: 'podcast';
  name: string;
  trackId?: string | number;
  trackName?: string;
  playedFrom?: number;
}>;

export type TrackInput = Readonly<
  {
    artistId?: number | string;
    id: string | number;
    type: 'track';
    name: string;
    trackId: string | number;
    trackArtistId: string | number;
    trackArtistName: string;
  } & AtLeastOneRequired<{ trackTitle: string; trackName: string }>
>;

export type Data = { sessionId?: string | null; playedFrom?: number | null } & (
  | AlbumInput
  | ArtistInput
  | CollectionInput
  | PlaylistRadioInput
  | MyPlaylistInput
  | MFRInput
  | LiveInput
  | MyMusicInput
  | PodcastInput
  | TrackInput
);

export function album(data: AlbumInput) {
  return function (context: string): StationAsset {
    return composeEventData(`${context}|album`)(
      namespace('asset')(
        property('id', `artist|${String(data.artistId)}`, true),
        property('name', data.artistName, false),
        namespace('sub')(
          property('id', `album|${data.id}`, true),
          property('name', data.name, false),
        ),
      ),
    ) as StationAsset;
  };
}

export function artist({ id, name, artistName }: ArtistInput) {
  return function (context: string): StationAsset {
    return composeEventData(`${context}|artist`)(
      namespace('asset')(
        property('id', `artist|${id}`, true),
        property('name', name ?? artistName, false),
      ),
    ) as StationAsset;
  };
}

export function collection({
  collection: data = {},
  name,
  profileId,
  id: seedId,
}: CollectionInput) {
  let id = data.playlistId ?? data.id;
  let ownerId = data.userId ?? data.ownerId;
  let { reportingKey } = data;

  if (!reportingKey && !(id && ownerId)) {
    // temporary until we update our play buttons
    // ternary handles playlist category tiles in the playlist directory
    const { playlistId, userId }: { playlistId?: string; userId?: string } =
      seedId ? decodePlaylistSeedId(seedId) : {};
    return function (context: string): StationAsset {
      return composeEventData(`${context}|playlist`)(
        namespace('asset')(
          property('id', `playlist|${String(userId)}::${playlistId}`, true),
          property('name', name, false),
        ),
      ) as StationAsset;
    };
  } else if (reportingKey && !ownerId) {
    [ownerId, id] = reportingKey.split('::');
  } else if (!reportingKey) {
    reportingKey = `${String(ownerId)}::${id}`;
  }

  if (reportingKey?.indexOf('undefined') !== -1 || !name)
    logger.error(
      CONTEXTS.ANALYTICS,
      'no reporting key or name for collection on play',
    );
  let type = 'my_playlist';
  if (data.curated) {
    type = 'curated_playlist';
  } else if (data.type === PlaylistTypes.New4U) {
    type = 'new_for_you_playlist';
  } else if (Number(profileId) === Number(ownerId) && data.type !== 'default') {
    type = 'user_playlist';
  } else if (Number(profileId) !== Number(ownerId)) {
    type = 'shared_user_playlist';
  }

  return function (context: string): StationAsset {
    return composeEventData(`${context}|playlist`)(
      namespace('asset')(
        property('id', `${type}|${reportingKey}`, true),
        property('name', type === 'my_playlist' ? type : name, false),
      ),
    ) as StationAsset;
  };
}

export function myPlaylist({
  collection: data,
  name,
  id: seedId,
}: MyPlaylistInput) {
  const id = data.playlistId ?? data.id;
  const ownerId = data.userId ?? data.ownerId;

  if (!data.reportingKey && !(id && ownerId)) {
    // temporary until we update our play buttons
    const { playlistId, userId } = decodePlaylistSeedId(seedId);
    const reportingKey = `${String(userId)}::${playlistId}`;
    return function (context: string): StationAsset {
      return composeEventData(`${context}|playlist`)(
        namespace('asset')(
          property('id', `my_playlist|${reportingKey}`, true),
          property('name', name, true),
        ),
      ) as StationAsset;
    };
  }

  const reportingKey = data.reportingKey ?? `${String(ownerId)}::${id}`;

  return function (context: string): StationAsset {
    return composeEventData(`${context}|playlist`)(
      namespace('asset')(
        property('id', `my_playlist|${reportingKey}`, true),
        property('name', name, true),
      ),
    ) as StationAsset;
  };
}

export function playlistradio({
  collection: data = {},
  name,
  id: seedId,
}: PlaylistRadioInput) {
  const id = data.playlistId ?? data.id;
  const ownerId = data.userId ?? data.ownerId;

  if (!data.reportingKey && !(id && ownerId)) {
    // temporary until we update our play buttons
    const { playlistId, userId } = decodePlaylistSeedId(seedId);
    const [_userId, _playlistId] =
      playlistId.indexOf('/') > -1 ?
        playlistId.split('/')
      : [userId, playlistId];
    const reportingKey = `${String(_userId)}::${_playlistId}`;
    return (context: string): StationAsset => {
      return composeEventData(`${context}|playlist`)(
        namespace('asset')(
          property(
            'id',
            data.type === PlaylistTypes.New4U ?
              `new_for_you_radio|${reportingKey}`
            : `playlist_radio|${reportingKey}`,
            true,
          ),
          property('name', name, true),
        ),
      ) as StationAsset;
    };
  }

  const reportingKey = data.reportingKey ?? `${String(ownerId)}::${id}`;

  return function (context: string): StationAsset {
    return composeEventData(`${context}|playlist`)(
      namespace('asset')(
        property(
          'id',
          data.type === PlaylistTypes.New4U ?
            `new_for_you_radio|${reportingKey}`
          : `playlist_radio|${reportingKey}`,
          true,
        ),
        property('name', name, true),
      ),
    ) as StationAsset;
  };
}

export function favorites(data: MFRInput) {
  return function (context: string): StationAsset {
    return composeEventData(`${context}|favorites`)(
      namespace('asset')(
        property(
          'id',
          `${
            Number(data.id) === Number(data.profileId) ? 'my' : 'shared'
          }_favorites_radio|${String(data.profileId)}`,
          true,
        ),
        property('name', data.name, false),
      ),
    ) as StationAsset;
  };
}

export function live(data: LiveInput) {
  return function (context: string): StationAsset {
    return composeEventData(`${context}|live`)(
      namespace('asset')(
        property('id', `live|${data.id}`, true),
        property('name', data.name, false),
      ),
      property('fallbackErrorCode', data.fallbackErrorCode, false),
      property(
        'fallbackErrorDescription',
        data.fallbackErrorDescription,
        false,
      ),
    ) as StationAsset;
  };
}

export function mymusic(data: MyMusicInput) {
  return function (context: string): StationAsset {
    return composeEventData(`${context}|my_music`)(
      namespace('asset')(
        property('id', `my_music|${String(data.profileId)}`, true),
        property('name', 'my_music', false),
      ),
    ) as StationAsset;
  };
}

export function podcast(data: PodcastInput) {
  return function (context: string): StationAsset {
    return composeEventData(`${context}|podcast`)(
      namespace('asset')(
        property('id', `podcast|${data.id}`, true),
        property('name', data.name, false),
        namespace('sub', !!data.trackId)(
          property('id', `episode|${String(data.trackId)}`, true),
          property('name', data.trackName, false),
        ),
      ),
      property('playedFrom', data.playedFrom),
    ) as StationAsset;
  };
}

export function track(data: TrackInput) {
  const trackName = (data.trackTitle ?? data.trackName)!;
  const id = data?.id ?? data?.artistId;
  return function (context: string): StationAsset {
    return composeEventData(`${context}|artist`)(
      namespace('asset')(
        property('id', `artist|${id}`, true),
        property('name', data.name, false),
        namespace('sub')(
          property('id', `song|${String(data.trackId)}`, true),
          property('name', trackName, false),
        ),
      ),
    ) as StationAsset;
  };
}

export function station(data: Data) {
  let stationAsset: (context: string) => StationAsset;

  switch (data.type) {
    case STATION_TYPE.ALBUM:
      stationAsset = album(data as AlbumInput);
      break;
    case STATION_TYPE.ARTIST:
      stationAsset = artist(data as ArtistInput);
      break;
    case STATION_TYPE.COLLECTION:
      stationAsset = collection(data as CollectionInput);
      break;
    case STATION_TYPE.PLAYLIST_RADIO:
      stationAsset = playlistradio(data as PlaylistRadioInput);
      break;
    case STATION_TYPE.MY_PLAYLIST:
      stationAsset = myPlaylist(data as MyPlaylistInput);
      break;
    case STATION_TYPE.FAVORITES:
      stationAsset = favorites(data as MFRInput);
      break;
    case STATION_TYPE.LIVE:
      stationAsset = live(data as LiveInput);
      break;
    case STATION_TYPE.MY_MUSIC:
      stationAsset = mymusic(data as MyMusicInput);
      break;
    case STATION_TYPE.PODCAST:
      stationAsset = podcast(data as PodcastInput);
      break;
    case STATION_TYPE.TRACK:
      stationAsset = track(data as TrackInput);
      break;
    default:
      throw Error(`could not create event for input: ${safeStringify(data)}!`);
  }

  return function (context: string): Station {
    return composeEventData(context)(
      namespace('station')(
        stationAsset,
        property('playedFrom', data.playedFrom, false),
        property('sessionId', data.sessionId, false),
      ),
    ) as Station;
  };
}
