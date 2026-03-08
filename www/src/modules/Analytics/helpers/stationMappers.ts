import AlbumStation from 'web-player/models/Album';
import CollectionStation from 'web-player/models/Collection';
import CustomStation from 'web-player/models/Custom';
import LiveStation from 'web-player/models/Live';
import Media from 'web-player/models/Media';
import PlaylistRadioStation from 'web-player/models/PlaylistRadio';
import PlaylistTypes from 'constants/playlistTypes';
import PodcastStation from 'web-player/models/Podcast';
import { StationTypeValue } from 'constants/stationTypes';
import type { Station } from 'web-player/PlayerState';

type Asset = {
  id: string;
  name: string;
  sub?: {
    id: string;
    name: string;
  };
};

type TrackingData = {
  item?: { asset: Asset };
  station: {
    asset: Asset;
    fallbackErrorCode?: number;
    fallbackErrorDescription?: string;
    playheadPosition?: number;
  };
  playedFrom?: number;
};

const nonPodcastItem = (track?: Media) => {
  if (!(track && track.get('id'))) {
    return {};
  }
  return {
    item: {
      asset: {
        id: `artist|${String(track.get('artistId'))}`,
        // custom and live track models have different attirbutes for artist name
        name: track.get('artist') ?? track.get('artistName'),
        sub: {
          id: `song|${String(track.get('id'))}`,
          name: track.get('title'),
        },
      },
    },
  };
};

export const album = (station: AlbumStation, track: Media) => ({
  ...nonPodcastItem(track),
  station: {
    asset: {
      id: `artist|${String(station.get('artistId'))}`,
      name: station.get('artistName'),
      sub: {
        id: `album|${station.get('seedId')}`,
        name: station.get('name'),
      },
    },
  },
});

export const artist = (station: CustomStation, track: Media) => {
  const { item } = nonPodcastItem(track);
  return {
    item,
    station: {
      asset: {
        id: `artist|${station.get('seedId')}`,
        name: station.get('name'),
        sub: item?.asset?.sub,
      },
    },
  };
};

export const podcast = (
  station: PodcastStation,
  track: Media,
  position: number,
  playedFrom?: number,
) => {
  const data: TrackingData = {
    item: {
      asset: {
        id: `podcast|${station.get('seedId')}`,
        name: station.get('name'),
        sub: {
          id: `episode|${track.get('id')}`,
          name: track.get('title')!,
        },
      },
    },
    station: {
      asset: {
        id: `podcast|${station.get('seedId')}`,
        name: station.get('name'),
        sub: {
          id: `episode|${String(track.get('id'))}`,
          name: track.get('title')!,
        },
      },
      playheadPosition: position,
    },
  };

  if (typeof playedFrom !== 'undefined') {
    data.playedFrom = playedFrom;
  }

  return data;
};

const getCollectionType = (station: CollectionStation, profileId: number) => {
  if (station.get('curated')) {
    return 'curated_playlist';
  }
  if (station.get('playlistType') === PlaylistTypes.New4U) {
    return 'new_for_you_playlist';
  }
  if (
    Number(station.get('ownerId')) === profileId &&
    station.get('playlistType') !== 'default'
  ) {
    return 'user_playlist';
  }
  if (Number(station.get('ownerId')) !== profileId) {
    return 'shared_user_playlist';
  }
  return 'my_playlist';
};

export const collection = (
  station: CollectionStation,
  track: Media,
  profileId: number,
) => {
  const type = getCollectionType(station, profileId);
  const { item } = nonPodcastItem(track);
  const seedId = station.get('seedId');
  const [ownerId, id] =
    seedId.indexOf('/') > -1 ?
      seedId.split('/')
    : [station.get('ownerId'), seedId];
  return {
    item,
    station: {
      asset: {
        id: `${type}|${ownerId}::${id}`,
        name: type === 'my_playlist' ? type : station.get('name'),
        sub: item?.asset?.sub,
      },
    },
  };
};

export const playlistradio = (station: PlaylistRadioStation, track: Media) => {
  const seedId = station.get('seedId');
  // IHRWEB-19430: SOMEHOW, intermittently the `seedId` gets populated in the format of <OWNER_ID>/<PLAYLIST_ID>
  // dunno how, why or when - but if that happens, we need to split on that forward slash, instead of
  // using what is in the station model [DEM 2024/06/06]

  const [ownerId, playlistId] =
    seedId.indexOf('/') > -1 ?
      seedId.split('/')
    : [station.get('ownerId'), seedId];

  const id = (playlistType: string) => {
    switch (playlistType) {
      case PlaylistTypes.New4U:
        return `new_for_you_radio|${ownerId}::${playlistId}`;
      case PlaylistTypes.Default:
        return `my_playlist|${ownerId}::${playlistId}`;
      default:
        return `playlist_radio|${ownerId}::${playlistId}`;
    }
  };
  const name = (playlistType: string) => {
    if (playlistType === PlaylistTypes.Default) {
      return 'My Playlist';
    }
    return station.get('name');
  };
  const { item } = nonPodcastItem(track);
  return {
    item,
    station: {
      asset: {
        id: id(station.get('playlistType')),
        name: name(station.get('playlistType')),
        sub: item?.asset?.sub,
      },
    },
  };
};

export const favorites = (
  station: CustomStation,
  track: Media,
  profileId: number,
) => {
  const typePrefix =
    Number(station.get('seedId')) === Number(profileId) ? 'my' : 'shared';
  const { item } = nonPodcastItem(track);
  return {
    item,
    station: {
      asset: {
        id: `${typePrefix}_favorites_radio|${String(profileId)}`,
        name: station.get('name'),
        sub: item?.asset?.sub,
      },
    },
  };
};

export const live = ({
  station,
  currentTrack,
  fallbackErrorCode,
  fallbackErrorDescription,
}: {
  fallbackErrorCode?: number;
  fallbackErrorDescription?: string;
  station: LiveStation;
  currentTrack?: Media;
}) => {
  const { item } = nonPodcastItem(currentTrack);
  const asset = {
    id: `live|${station.get('seedId')}`,
    name: station.get('callLetters'),
    sub: item?.asset?.sub,
  };

  return {
    item: item ?? { asset },
    station: {
      asset,
      fallbackErrorCode,
      fallbackErrorDescription,
    },
  };
};

export const mymusic = (profileId: number, track: Media) => {
  const { item } = nonPodcastItem(track);
  return {
    item,
    station: {
      asset: {
        id: `my_music|${String(profileId)}`,
        name: 'my_music',
        sub: item?.asset?.sub,
      },
    },
  };
};

export const track = (station: CustomStation, currentTrack: Media) => ({
  ...nonPodcastItem(currentTrack),
  station: {
    asset: {
      id: `artist|${station.get('seedId')}`,
      name: station.get('name'),
      sub: {
        id: `song|${String(currentTrack.get('id'))}`,
        name: currentTrack.get('title'),
      },
    },
  },
});

export const mapStationToAnalyticsData = ({
  station,
  currentTrack,
  profileId,
  playedFrom,
  fallbackErrorCode,
  fallbackErrorDescription,
}: {
  station: Station;
  currentTrack: Media;
  profileId: number;
  playedFrom?: number;
  fallbackErrorCode?: number;
  fallbackErrorDescription?: string;
}) => {
  const type = station.get('seedType') as StationTypeValue;
  switch (type) {
    case 'album':
      return album(station, currentTrack);
    case 'artist':
      return artist(station, currentTrack);
    case 'collection':
      return collection(station, currentTrack, profileId);
    case 'playlistradio':
      return playlistradio(station, currentTrack);
    case 'favorites':
      return favorites(station, currentTrack, profileId);
    case 'podcast':
      return podcast(station, currentTrack, playedFrom!);
    case 'live':
      return live({
        currentTrack,
        fallbackErrorCode: fallbackErrorCode!,
        fallbackErrorDescription: fallbackErrorDescription!,
        station,
      });
    case 'mymusic':
      return mymusic(profileId, currentTrack);
    default:
      return undefined;
  }
};
