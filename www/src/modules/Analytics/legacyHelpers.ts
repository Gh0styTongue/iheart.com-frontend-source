/* eslint-disable camelcase */

/*
  🚧
    This code was very poorly implemented. Do not model future analaytics
    helpers off this code. In fact, the plan is to convert these helpers to
    follow patterns similar to code you will see in modules/Analytics/helpers/.
  🚧
*/

import PLAYED_FROM from './constants/playedFrom';
import PlaylistTypes from 'constants/playlistTypes';
import { get, omit } from 'lodash-es';
import { getDailySkips, getHourlySkips } from 'state/Player/selectors';
import { getProfileId } from 'state/Session/selectors';
import { isPlaylist } from 'state/Playlist/helpers';
import { STATION_TYPE } from 'constants/stationTypes';

export type PlaylistAnalyticsDataParams = {
  curated?: any;
  edit?: boolean | undefined;
  name?: string;
  profileId: number | null;
  playlistId?: any;
  playlist?: any;
  type?: any;
  userId?: any;
  stationType: any;
};

export const getPlaylistAnalyticsData = ({
  curated,
  edit = false,
  name,
  profileId,
  playlistId,
  playlist,
  type,
  userId,
  stationType,
}: PlaylistAnalyticsDataParams) => {
  const id = playlist ? playlist.id : playlistId;
  const isCurated = playlist ? playlist.curated : curated;
  const playlistType = playlist ? playlist.type : type;
  const user = playlist ? playlist.userId : userId;
  const [_user, _id] = id?.indexOf('/') > -1 ? id.split('/') : [user, id];
  if (isCurated) {
    if (stationType === STATION_TYPE.PLAYLIST_RADIO) {
      return {
        id: `playlist_radio|${_user}::${_id}`,
        name,
        pageName: 'playlist_radio_profile',
      };
    }
    return {
      id: `curated_playlist|${_user}::${_id}`,
      name,
      pageName: 'curated_playlist_profile',
    };
  }
  if (playlistType === PlaylistTypes.New4U) {
    if (stationType === STATION_TYPE.PLAYLIST_RADIO) {
      return {
        id: `new_for_you_radio|${_user}::${_id}`,
        name,
        pageName: 'new_for_you_radio_profile',
      };
    }
    return {
      id: `new_for_you_playlist|${_user}::${_id}`,
      name,
      pageName: 'new_for_you_playlist_profile',
    };
  }
  if (profileId === Number(user) && playlistType !== PlaylistTypes.Default) {
    return {
      id: `user_playlist|${_user}::${_id}`,
      name,
      pageName: edit ? 'edit_user_playlist' : 'user_playlist_profile',
    };
  }
  if (profileId !== Number(user)) {
    return {
      id: `shared_user_playlist|${_user}::${_id}`,
      name,
      pageName: 'shared_user_playlist_profile',
    };
  }

  return {
    id: `my_playlist|${_user}::${_id}`,
    name: 'My Playlist',
    pageName: edit ? 'edit_my_playlist' : 'my_playlist_profile',
  };
};

export function formatStationAsset({
  artistId,
  artistName,
  callLetters,
  id,
  name,
  profileId,
  type,
  playlistData,
}: {
  artistId: any;
  artistName: any;
  callLetters: any;
  episodeId?: any;
  episodeName?: any;
  id: any;
  name: any;
  profileId: any;
  type: any;
  playlistData: any;
}) {
  if (type === STATION_TYPE.ALBUM) {
    return {
      id: `artist|${artistId}`,
      name: artistName,
      sub: {
        id: `album|${id}`,
        name,
      },
    };
  }
  if (type === STATION_TYPE.TRACK) {
    return {
      id: `${id ? 'artist' : 'song'}|${artistId}`,
      name: artistName,
      sub:
        id ?
          {
            id: `song|${id}`,
            name,
          }
        : undefined,
    };
  }
  if (isPlaylist(type)) {
    return omit(
      getPlaylistAnalyticsData({
        name,
        profileId,
        stationType: type,
        ...playlistData,
      }),
      ['pageName'],
    );
  }
  if (type === STATION_TYPE.FAVORITES) {
    return {
      id: `${profileId === id ? 'my' : 'shared'}_favorites_radio|${id}`,
      name,
    };
  }
  if (type === STATION_TYPE.LIVE) {
    return {
      id: `live|${id}`,
      name: callLetters,
    };
  }
  if (type === STATION_TYPE.MY_MUSIC) {
    return {
      id: `my_music|${profileId}`,
      name: 'my_music',
    };
  }
  if (type === STATION_TYPE.PODCAST) {
    return {
      id: `podcast|${id}`,
      name,
      sub: null,
    };
  }
  return {
    id: `${type}|${id}`,
    name,
  };
}

export const getPlayerAnalyticsData =
  (playerState: any, reduxState: any, endReason: any) =>
  ({ events: { play = [], stream_start = [] } }) => {
    const station = playerState.get('station');
    const track = playerState.get('track');
    const isReplay = !!track && track.get('isReplay');
    let fallback;
    let listenTime;
    let replayCount;

    const shuffleEnabled =
      station.get('seedType') === 'collection' ?
        `${!!playerState.get('shuffleReporting')}`
      : undefined;

    const streamProtocol =
      station.get('seedType') === 'live' ?
        station.get('reportStreamType')
      : undefined;

    // we need queryId to follow the playback session, but the value in redux is cleared on
    // navigation so we store it on the station if it's present on the first stream start event
    const queryId = station.get('queryId');
    const search =
      queryId ?
        {
          search: {
            queryId,
          },
        }
      : {};

    if (!endReason) {
      playerState.set('shouldTrackStreamStart', false);
      const startTime = performance.now();
      playerState.set('startTime', startTime);
    } else {
      fallback = playerState.get('usedFallback') ? streamProtocol : undefined;
      replayCount =
        station.get('seedType') === 'podcast' ?
          undefined
        : playerState.get('replayCount');
      playerState.set('replayCount', 0);
      playerState.set('shouldTrackStreamStart', true);
      const endTime = performance.now();
      const startTime = playerState.get('startTime');
      listenTime = Math.round((endTime - startTime) / 1000);
    }
    return {
      station: {
        asset: omit(
          formatStationAsset({
            artistId:
              isReplay ? track.get('artistId') : station.get('artistId'),
            artistName: isReplay ? track.get('artist') : station.get('artist'),
            callLetters: station.get('callLetters'),
            episodeId: track?.get('id'),
            episodeName: track?.get('title'),
            id: isReplay ? track.get('trackId') : station.get('seedId'),
            name: isReplay ? track.get('title') : station.get('name'),
            playlistData: {
              curated: station.get('curated'),
              playlistId: station.get('playlistId'),
              type: station.get('playlistType'),
              userId: station.get('ownerId'),
            },
            profileId: getProfileId(reduxState),
            type: isReplay ? STATION_TYPE.TRACK : station.get('seedType'),
          }),
          ['pageName'],
        ),
        daySkipsRemaining: getDailySkips(reduxState),
        endReason,
        fallback,
        hadPreroll: `${!!playerState.get('hadPreroll')}`,
        hourSkipsRemaining: getHourlySkips(reduxState),
        isSaved: `${!!station.get('favorite')}`,
        listenTime,
        playbackStartTime: endReason ? undefined : Date.now(),
        playedFrom:
          playerState.get('tracking').playedFrom || PLAYED_FROM.DEFAULT,
        replayCount,
        sessionId: get(endReason ? stream_start.slice(-1) : play.slice(-1), [
          '0',
          'station',
          'sessionId',
        ]),
        shuffleEnabled,
        streamInitTime:
          endReason ? undefined : playerState.get('streamInitTime'),
        streamProtocol,
      },
      ...search,
    };
  };

type GetFollowAnalyticsDataArgs = {
  followed: any;
  name: any;
  location?: string;
  view?: {
    pageName: string;
    tab?: string;
  };
} & (
  | {
      playlist: any;
      profileId: any;
      stationType?: any;
      queryId?: string;
    }
  | {
      id: any;
      prefix: any;
      queryId?: string;
    }
);

export function getFollowAnalyticsData({
  followed,
  name,
  queryId,
  location,
  view,
  ...data
}: GetFollowAnalyticsDataArgs) {
  const asset =
    'playlist' in data ?
      getPlaylistAnalyticsData({
        name,
        playlist: data.playlist,
        profileId: data.profileId,
        stationType: data.stationType,
      })
    : { id: `${data.prefix}|${data.id}`, name };
  return {
    station: {
      asset,
      savedType: followed ? 'follow' : 'unfollow',
    },
    ...(location ? { event: { location } } : {}),
    ...(view ? { view } : {}),
    ...(queryId ?
      {
        search: {
          queryId,
        },
      }
    : {}),
  };
}

export function getSearchAnalyticsData({
  exitType,
  profileId,
  searchFilter,
  userSearchTerm,
  title,
  topHit,
  asset: {
    artistId,
    artistName,
    callLetters,
    contentType,
    catalogId,
    id,
    catalogType: type,
    catalogUserId: userId,
    title: name,
  } = {},
  queryId,
  selected,
}: {
  exitType: any;
  profileId: any;
  searchFilter: any;
  selected: number;
  userSearchTerm: any;
  title: any;
  topHit: any;
  asset?:
    | {
        artistId?: any;
        artistName?: any;
        callLetters?: any;
        contentType?: any;
        catalogId?: any;
        id?: any;
        catalogType?: any;
        catalogUserId?: any;
        title?: any;
      }
    | undefined;
  queryId: string;
}) {
  let screen = searchFilter ? `${searchFilter}s` : 'search';
  if (searchFilter === 'station') screen = 'live_stations';
  if (searchFilter === 'track') screen = 'songs';
  let selectionCategory = title && title.toLowerCase().replace(/\s/g, '_');
  if (selectionCategory === 'stations') selectionCategory = 'live_stations';

  return {
    search: {
      exitType,
      screen,
      searchType: 'search_term',
      selectionCategory,
      topHit: topHit && topHit.name ? topHit : undefined,
      userSearchTerm,
      queryId,
      selectionCategoryPosition: selected,
    },
    station:
      contentType || type ?
        {
          asset:
            contentType === 'link' ?
              {
                id: `${contentType}|${id}`,
                name,
              }
            : omit(
                formatStationAsset({
                  artistId,
                  artistName,
                  callLetters,
                  id: catalogId,
                  name,
                  playlistData: {
                    curated: true,
                    playlistId: catalogId,
                    userId,
                  },
                  profileId,
                  type,
                }),
                ['pageName'],
              ),
        }
      : undefined,
  };
}
