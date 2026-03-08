import Events from 'modules/Analytics/constants/events';
import paths from 'router/Routes/paths';
import { matchPath } from 'react-router';
import { STATION_TYPE } from 'constants/stationTypes';
import {
  TRIGGER_FROM_HERO,
  TRIGGER_FROM_PLAYER_ROW,
  TRIGGER_FROM_TILE,
} from 'state/Playlist/constants';
import type { EventKeyMap } from 'modules/Analytics/types';

export type ScreenTypeInputProps = {
  playlistId?: string | number | undefined;
  playlistUserId?: string;
  playlistName?: string;
  artistName?: string;
  artistId?: string | number;
  currentAlbumId?: string | number;
  currentAlbumTitle?: string;
  stationType?: string;
};

export type ScreenTypeOutputProps = {
  albumId?: string | number;
  albumTitle?: string;
  artistId?: string | number;
  artistName?: string;
  playlistId?: string;
  playlistName?: string;
  screen: string;
};

type Screen = 'artist' | 'playlist' | 'song' | 'album' | 'other';

export const BRAZE_CUSTOM_EVENTS = {
  AAPreview: 'AA_Preview',
  FollowArtist: 'Follow_Artist',
  FollowPlaylist: 'Follow_Playlist',
  FollowPodcast: 'Follow_Podcast',
  PageView: 'Page_View',
  Share: 'Share',
  StationFavorite: 'Station_Favorite',
  StreamStart: 'Stream_Start',
  HighlightsStreamStart: 'Highlights_Stream_Start',
  StationUnfavorite: 'Station_Unfavorite',
  UnfollowArtist: 'Unfollow_Artist',
  UnfollowPlaylist: 'Unfollow_Playlist',
  UnfollowPodcast: 'Unfollow_Podcast',
  Upsell: 'Upsell',
  thumbs_down: 'Thumb_Down',
  thumbs_up: 'Thumb_Up',
  unthumb_down: 'Unthumb_Down',
  unthumb_up: 'Unthumb_Up',
};

/**
 * Trackers often expect different names for the same events. We have a single
 * source of truth in `EVENTS` so we need to map those to what the tracker is
 * expecting in some cases.
 */
export const eventKeyMap: Partial<EventKeyMap> = {
  [Events.AAPreview]: BRAZE_CUSTOM_EVENTS.AAPreview,
  [Events.FollowArtist]: BRAZE_CUSTOM_EVENTS.FollowArtist,
  [Events.FollowPlaylist]: BRAZE_CUSTOM_EVENTS.FollowPlaylist,
  [Events.FollowPodcast]: BRAZE_CUSTOM_EVENTS.FollowPodcast,
  [Events.PageView]: BRAZE_CUSTOM_EVENTS.PageView,
  [Events.SaveStation]: BRAZE_CUSTOM_EVENTS.StationFavorite,
  [Events.Share]: BRAZE_CUSTOM_EVENTS.Share,
  [Events.StreamStart]: BRAZE_CUSTOM_EVENTS.StreamStart,
  [Events.HighlightsStreamStart]: BRAZE_CUSTOM_EVENTS.HighlightsStreamStart,
  [Events.ThumbsDown]: BRAZE_CUSTOM_EVENTS.thumbs_down,
  [Events.ThumbsUp]: BRAZE_CUSTOM_EVENTS.thumbs_up,
  [Events.UnfollowArtist]: BRAZE_CUSTOM_EVENTS.UnfollowArtist,
  [Events.UnfollowPlaylist]: BRAZE_CUSTOM_EVENTS.UnfollowPlaylist,
  [Events.UnfollowPodcast]: BRAZE_CUSTOM_EVENTS.UnfollowPodcast,
  [Events.UnsaveStation]: BRAZE_CUSTOM_EVENTS.StationUnfavorite,
  [Events.UnthumbDown]: BRAZE_CUSTOM_EVENTS.unthumb_down,
  [Events.UnthumbUp]: BRAZE_CUSTOM_EVENTS.unthumb_up,
  [Events.UpsellOpen]: BRAZE_CUSTOM_EVENTS.Upsell,
};

// We only care to track the following events for Braze.
// This will differ for each tracker.
export const trackedEvents = [
  Events.AAPreview,
  Events.FollowArtist,
  Events.FollowPlaylist,
  Events.FollowPodcast,
  Events.PageView,
  Events.RegGateExit,
  Events.SaveStation,
  Events.Share,
  Events.StreamStart,
  Events.HighlightsStreamStart,
  Events.ThumbsDown,
  Events.ThumbsUp,
  Events.UnfollowArtist,
  Events.UnfollowPlaylist,
  Events.UnfollowPodcast,
  Events.UnsaveStation,
  Events.UnthumbDown,
  Events.UnthumbUp,
  Events.UpsellOpen,
];

const getScreen: (pathnameForTest?: string, stationType?: string) => Screen = (
  pathnameForTest,
  stationType,
) => {
  if (__CLIENT__) {
    const path = pathnameForTest || window.location.pathname;
    const isMatch = (comparePath: string) =>
      !!matchPath(path, {
        exact: true,
        path: comparePath,
        strict: false,
      });
    if (isMatch(paths.artist.profile)) return 'artist';
    if (isMatch(paths.playlist.profile)) return 'playlist';
    if (isMatch(paths.artist.songs) || isMatch(paths.artist.song))
      return 'song';
    if (isMatch(paths.artist.album)) return 'album';

    if (stationType) {
      if (
        stationType === STATION_TYPE.TRACK ||
        stationType === STATION_TYPE.SONG
      )
        return 'song';
      if (stationType === STATION_TYPE.ARTIST) return 'artist';
      if (stationType === STATION_TYPE.PLAYLIST_RADIO) return 'playlist';
      if (stationType === STATION_TYPE.ALBUM) return 'album';
    }
  }
  return 'other';
};

export const getScreenPropsForUpsellSong2Start = (
  props: ScreenTypeInputProps,
  pathnameForTest?: string,
): ScreenTypeOutputProps | null => {
  const {
    playlistId,
    playlistUserId,
    playlistName,
    artistName,
    artistId,
    currentAlbumId,
    currentAlbumTitle,
    stationType,
  } = props;

  const screen = getScreen(pathnameForTest, stationType);

  const screenPropsMap = {
    album: {
      albumId: currentAlbumId,
      albumTitle: currentAlbumTitle,
      screen: 'albumProfile',
    },
    artist: {
      artistId,
      artistName,
      screen: 'artistProfile',
    },
    other: null,
    playlist: {
      playlistId: `${playlistUserId}::${playlistId}`,
      playlistName,
      screen: 'playlistProfile',
    },
    song: {
      artistId,
      artistName,
      screen: 'songProfile',
    },
  };

  return screenPropsMap[screen];
};

export const BrazeTracking = ({
  curated,
  isTrialEligible,
  subscriptionType,
  playedFromTrigger,
}: {
  curated?: boolean;
  isTrialEligible?: boolean;
  subscriptionType?: string;
  playedFromTrigger?: string;
}) => {
  const upsellFromMap = {
    '91': playedFromTrigger === TRIGGER_FROM_PLAYER_ROW && !curated,
    '93': playedFromTrigger === TRIGGER_FROM_PLAYER_ROW && curated,
    '94': playedFromTrigger === TRIGGER_FROM_HERO && !curated,
    '96': playedFromTrigger === TRIGGER_FROM_HERO && curated,
    '100': playedFromTrigger === TRIGGER_FROM_TILE && !curated,
    '102': playedFromTrigger === TRIGGER_FROM_TILE && curated,
  };

  const upsellFrom = (
    Object.keys(upsellFromMap) as Array<keyof typeof upsellFromMap>
  ).find(key => upsellFromMap[key]);

  return {
    isTrialEligible,
    source: 'Recurly',
    subscriptionType,
    upsell_from: upsellFrom,
  };
};
