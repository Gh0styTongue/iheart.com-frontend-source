import PlaylistTypes from 'constants/playlistTypes';
import { concatTitleAndVersion } from 'utils/trackFormatter';
import { createSelector } from 'reselect';
import { encodePlaylistSeedId } from './helpers';
import { get, mapValues } from 'lodash-es';
import { getTracks as getFullTracks } from 'state/Tracks/selectors';
import {
  getInternationalPlaylistRadioEnabled,
  getOnDemandEnabled,
} from 'state/Features/selectors';
import { getProfileId } from 'state/Session/selectors';
import { getResourceId, PlaylistInfo } from 'state/Routing/selectors';
import { getUserType } from 'state/User/selectors';
import {
  playPlaylistOnDemandSelector,
  playPlaylistRadioSelector,
  showPlaylistRadioSelector,
} from 'state/Entitlements/selectors';
import { REQUEST_STATE } from './constants';
import { STATION_TYPE } from 'constants/stationTypes';
import type {
  CurrentPlaylistType,
  Playlist,
  PlaylistStation,
  State,
} from './types';
import type { State as RootState, Selector } from 'state/types';
import type { StationTypeValue } from 'constants/stationTypes';
import type { Track } from 'state/Tracks/types';

export const getPlaylistState = createSelector<RootState, RootState, State>(
  state => state,
  state => get(state, 'playlist', {}) as State,
);

export const getPlaylists = createSelector<
  RootState,
  State,
  Record<string, Playlist>
>(getPlaylistState, state => get(state, 'playlists'));

export const getPlaylistsInArray = createSelector(
  getPlaylistState,
  state => Object.values(state?.playlists) ?? [],
);

export const getOwnedAndFollowedPlaylists = createSelector(
  getPlaylistsInArray,
  getProfileId,
  (playlists, profileId) =>
    playlists.filter(
      ({ followed, ownerId, deleted }) =>
        !deleted && (followed || String(ownerId) === String(profileId)),
    ),
);

export const getMyPlaylistId = createSelector(getPlaylistState, state =>
  get(state, 'myPlaylist', ''),
);

export const getCurrentPlaylist = createSelector(
  getPlaylists,
  getResourceId,
  (playlists, resourceId) =>
    get(
      playlists,
      encodePlaylistSeedId(get(resourceId, 'owner'), get(resourceId, 'id')),
      {},
    ) as Playlist,
);

export const getCurrentTrackCount: Selector<number> = createSelector(
  getCurrentPlaylist,
  playlist => {
    return playlist?.tracks?.filter(track => !track.removed).length ?? 0;
  },
);

export function makeCurrentPlaylistSelector<T>(
  attr: string,
  fallback: T | null | undefined = undefined,
): Selector<T> {
  return createSelector(getCurrentPlaylist, playlist =>
    get(playlist, attr, fallback),
  );
}

export const getCurrentType: Selector<CurrentPlaylistType> =
  makeCurrentPlaylistSelector('type', null);

export const getCurrentName: Selector<string | undefined> =
  makeCurrentPlaylistSelector('name');

export const getCurrentDescription: Selector<string> =
  makeCurrentPlaylistSelector('description', '');

export const getCurrentUrls: Selector<{
  [a: string]: any;
}> = makeCurrentPlaylistSelector('urls', {});

export const getCurrentCanonicalUrl: Selector<string> = createSelector(
  getCurrentUrls,
  urls => get(urls, 'web', ''),
);

export const getCurrentPlaylistId = createSelector<
  RootState,
  string,
  string | PlaylistInfo | null,
  string
>(
  makeCurrentPlaylistSelector('playlistId'),
  getResourceId,
  (fromPlaylist, resourceId) => fromPlaylist || get(resourceId, 'id', ''),
);

export const getCurrentOwnerId = createSelector<
  RootState,
  number,
  string | PlaylistInfo | null,
  number | string
>(
  makeCurrentPlaylistSelector('ownerId'),
  getResourceId,
  (fromPlaylist, resourceId) => fromPlaylist || get(resourceId, 'owner', ''),
);

export const getCurrentSeedId: Selector<string> = createSelector<
  RootState,
  number,
  string | PlaylistInfo | null,
  string
>(
  makeCurrentPlaylistSelector('seedId'),
  getResourceId,
  (fromPlaylist, resourceId) =>
    fromPlaylist ||
    encodePlaylistSeedId(
      get(resourceId, 'owner', ''),
      get(resourceId, 'id', ''),
    ),
);

export const getCurrentSlug: Selector<string | undefined> =
  makeCurrentPlaylistSelector('slug');

export const getCurrentRequestState: Selector<string> =
  makeCurrentPlaylistSelector('requestState', REQUEST_STATE.NOT_REQUESTED);

export const getCurrentIsCurated: Selector<boolean> =
  makeCurrentPlaylistSelector('curated', false);

// TODO: check that this is the correct prop name (amp hasn't implemented)
export const getCurrentIsPremiumPlaylist: Selector<boolean> = createSelector(
  getCurrentPlaylist,
  playlist => get(playlist, 'premium', false),
);

export const getCurrentAllowedTrackCount: Selector<number | undefined> =
  makeCurrentPlaylistSelector('allowed');

export const getCurrentPlayableAsRadio: Selector<boolean | undefined> =
  makeCurrentPlaylistSelector('playableAsRadio', false);

export const getCanPlayCurrentOD: Selector<boolean> = createSelector(
  getCurrentAllowedTrackCount,
  playPlaylistOnDemandSelector,
  (tracksAllowed, entitled) => entitled || tracksAllowed! > 0,
);

export const getCanPlayCurrentRadio: Selector<boolean> = createSelector(
  getCurrentType,
  getCurrentIsPremiumPlaylist,
  getCurrentPlayableAsRadio,
  getCurrentIsCurated,
  playPlaylistRadioSelector,
  (
    type,
    isPremiumPlaylist,
    playableAsRadio = false,
    curated,
    canPlayPlaylistRadio,
  ) => {
    return (
      (!isPremiumPlaylist ||
        type === PlaylistTypes.Default ||
        playableAsRadio ||
        curated) &&
      canPlayPlaylistRadio
    );
  },
);

export const getCurrentCanPlay: Selector<boolean> = createSelector(
  getCanPlayCurrentOD,
  getCanPlayCurrentRadio,
  (odEligible, radioEligible) => {
    return (odEligible || radioEligible) ?? false;
  },
);

export const getCanPlayPremiumPlaylist: Selector<boolean> = createSelector(
  getUserType,
  userType => userType === 'PREMIUM',
);

export const getCurrentStationType: Selector<StationTypeValue> = createSelector(
  getCanPlayCurrentOD,
  getCanPlayCurrentRadio,
  (odEligible, radioEligible) => {
    return radioEligible && !odEligible ?
        STATION_TYPE.PLAYLIST_RADIO
      : STATION_TYPE.COLLECTION;
  },
);

export const getCurrentShowPlaylistButtons = createSelector(
  getCurrentStationType,
  showPlaylistRadioSelector,
  getInternationalPlaylistRadioEnabled,
  getOnDemandEnabled,
  getCanPlayCurrentOD,
  (
    stationType,
    showPlaylistButtons,
    isInternationalPlaylistRadio,
    onDemandEnabled,
    odEligible,
  ) =>
    odEligible ||
    (stationType === STATION_TYPE.PLAYLIST_RADIO &&
      (showPlaylistButtons || isInternationalPlaylistRadio || onDemandEnabled)),
);

export const getCurrentPlaylistType: Selector<CurrentPlaylistType> =
  makeCurrentPlaylistSelector('playlistType');

export const getCurrentTrackIds: Selector<
  Array<{ id: string; removed?: boolean; trackId: number }>
> = makeCurrentPlaylistSelector('tracks', []);
export const getCurrentTrackHash: Selector<{ [a: number]: string }> =
  createSelector(getCurrentTrackIds, playlistTracks =>
    playlistTracks.reduce(
      (acc, next) => {
        acc[next.trackId] = next.id;
        return acc;
      },
      {} as { [a: number]: string },
    ),
  );

export const getCurrentBackfillTrackIds: Selector<Array<number>> =
  makeCurrentPlaylistSelector('backfillTracks', []);

export const getCurrentTracks: Selector<Array<Track>> = createSelector(
  getFullTracks,
  getCurrentTrackIds,
  (tracks, ids) => {
    return ids.reduce((currentTracks, trackInfo) => {
      const { removed, trackId, id } = trackInfo;
      if (!removed) {
        const newTrackInfo =
          trackId && tracks[trackId] ?
            {
              ...tracks[trackId],
              title: concatTitleAndVersion(
                tracks[trackId]?.title,
                tracks[trackId]?.version,
              ),
              uuid: id,
            }
          : null;
        if (newTrackInfo) {
          currentTracks.push(newTrackInfo);
        }
      }
      return currentTracks;
    }, [] as Array<Track>);
  },
);

export const getCurrentBackfillTracks: Selector<Array<Track>> = createSelector(
  getFullTracks,
  getCurrentBackfillTrackIds,
  (tracks = {}, ids = []) => {
    const backfillTracks: Array<Track> = [];
    ids.forEach(id => {
      if (tracks[id]) {
        backfillTracks.push(tracks[id]);
      }
    });

    return backfillTracks;
  },
);

// This is different from the makeCurrentPlaylist selector for 'duration'
// That number is incorrect, as it does not take into the backfill tracks durations
// This selector does [DEM 03/04/2021]
export const getCurrentTracksDuration: Selector<number> = createSelector(
  getFullTracks,
  getCurrentType,
  getCurrentTrackIds,
  getCurrentBackfillTrackIds,
  (tracks, type, trackIds, backfillTrackIds) => {
    const allTrackIds = trackIds
      .map(({ trackId }) => trackId)
      .concat(type === PlaylistTypes.Default ? backfillTrackIds : []);
    return Object.values(tracks).reduce((acc: number, track: Track) => {
      let duration = 0;
      if (allTrackIds.includes(track.id)) {
        duration = track.duration;
      }
      return acc + duration;
    }, 0);
  },
);

export const getCurrentAuthor: Selector<string> = makeCurrentPlaylistSelector(
  'author',
  '',
);

export const getCurrentDuration: Selector<number> = makeCurrentPlaylistSelector(
  'duration',
  0,
);

export const getCurrentImageUrl: Selector<string> = makeCurrentPlaylistSelector(
  'imgUrl',
  '',
);

export const getCurrentReportingKey: Selector<string | null | undefined> =
  makeCurrentPlaylistSelector('reportingKey');

export const getCurrentPlaylistIsMine: Selector<boolean> = createSelector(
  getProfileId,
  getCurrentOwnerId,
  (profileId, ownerId) => String(profileId) === String(ownerId),
);

export const getCurrentLastUpdated: Selector<number> =
  makeCurrentPlaylistSelector('lastUpdated');
export const getCurrentIsShuffled: Selector<boolean> =
  makeCurrentPlaylistSelector('isShuffled');
export const getCurrentIsDeletable: Selector<boolean> =
  makeCurrentPlaylistSelector('deletable');
export const getCurrentIsRenameable: Selector<boolean> =
  makeCurrentPlaylistSelector('renameable');
export const getCurrentIsWritable: Selector<boolean> =
  makeCurrentPlaylistSelector('writeable');
export const getCurrentIsShareable: Selector<boolean> =
  makeCurrentPlaylistSelector('shareable');
export const getCurrentAllowedNumber: Selector<number | undefined> =
  makeCurrentPlaylistSelector('allowed');

export type GetPlaylistSeedIdProps = {
  playlistId?: string;
  playlistUserId?: string;
  seedId?: string | number;
};

export const getPlaylistSeedId = (
  state: RootState,
  { playlistId, playlistUserId, seedId }: GetPlaylistSeedIdProps,
): string =>
  seedId ||
  (playlistId && encodePlaylistSeedId(playlistUserId, playlistId)) ||
  '';

export const getPlaylist = createSelector<
  RootState,
  { playlistId?: string; playlistUserId?: string; seedId?: string | number },
  Record<string, Playlist>,
  string,
  Playlist
>(
  getPlaylists,
  getPlaylistSeedId,
  (playlists, seedId) => get(playlists, seedId, {}) as Playlist,
);

export function makePlaylistSelector<K extends keyof Playlist, F = Playlist[K]>(
  attr: K,
  fallback?: F,
) {
  return createSelector<
    RootState,
    { playlistId?: string; playlistUserId?: string; seedId?: string | number },
    Playlist,
    Playlist[K] | F
  >(getPlaylist, playlist => get(playlist, attr, fallback) as Playlist[K] | F);
}

export const getType = makePlaylistSelector('type', '');

export const getName = makePlaylistSelector('name');

export const getDescription = makePlaylistSelector('description', '');

export const getMetaDescription = makePlaylistSelector('metaDescription', '');

export const getUrls = makePlaylistSelector('urls', {});

export const getPlaylistId = makePlaylistSelector('playlistId');

export const getUserId = makePlaylistSelector('userId');

export const getSeedId = makePlaylistSelector('seedId');

export const getSlug = makePlaylistSelector('slug');

export const getIsCurated = makePlaylistSelector('curated', false);

export const getIsShareable = makePlaylistSelector('shareable', false);

export const getIsShuffled = makePlaylistSelector('isShuffled', false);

export const getIsFollowable = makePlaylistSelector('followable', false);

export const getIsFollowed = makePlaylistSelector('followed', false);

export const getIsPremiumPlaylist = createSelector(getPlaylist, playlist =>
  get(playlist, 'premium', false),
);

export const getAllowedTrackCount = makePlaylistSelector('allowed');

export const canPlayOD = createSelector(
  getAllowedTrackCount,
  playPlaylistOnDemandSelector,
  (tracksAllowed, entitled) => !!(entitled || tracksAllowed! > 0),
);

export const getPlayableAsRadio = makePlaylistSelector('playableAsRadio');

export const canPlayRadio = createSelector(
  getIsPremiumPlaylist,
  playPlaylistRadioSelector,
  getPlayableAsRadio,
  (isPremiumPlaylist, entitled, playableAsRadio) =>
    !!((!isPremiumPlaylist && entitled) || playableAsRadio),
);

export const getCanPlay = createSelector(
  canPlayOD,
  canPlayRadio,
  (odEligible, radioEligible) => !!(odEligible || radioEligible),
);

export const getStationType = createSelector(
  canPlayOD,
  canPlayRadio,
  (odEligible, radioEligible) =>
    radioEligible && !odEligible ?
      STATION_TYPE.PLAYLIST_RADIO
    : STATION_TYPE.COLLECTION,
);

export const getShowPlaylistButtons = createSelector(
  getStationType,
  showPlaylistRadioSelector,
  getInternationalPlaylistRadioEnabled,
  getOnDemandEnabled,
  canPlayOD,
  (
    stationType,
    showPlaylistButtons,
    isInternationalPlaylistRadio,
    onDemandEnabled,
    odEligible,
  ): boolean =>
    odEligible ||
    (stationType === STATION_TYPE.PLAYLIST_RADIO &&
      (showPlaylistButtons || isInternationalPlaylistRadio || onDemandEnabled)),
);

export const getTracks = makePlaylistSelector('tracks', []);

export const getAuthor = makePlaylistSelector('author', '');

export const getDuration = makePlaylistSelector('duration', 0);

export const getImageUrl = makePlaylistSelector('imgUrl', '');

export const getOwnerId = makePlaylistSelector('ownerId');

export const getPlaylistIsMine = createSelector(
  getProfileId,
  getOwnerId,
  (profileId, ownerId) => profileId === ownerId,
);

export const getPlaylistStations = createSelector<
  RootState,
  Record<string, Playlist>,
  boolean,
  boolean,
  Record<string, PlaylistStation>
>(
  getPlaylists,
  playPlaylistOnDemandSelector,
  playPlaylistRadioSelector,
  (playlists, odEligible, radioEligible): Record<string, PlaylistStation> =>
    mapValues(playlists, playlist => {
      const { allowed, premium } = playlist;
      const stationType =
        !premium && radioEligible && !(odEligible || allowed! > 0) ?
          STATION_TYPE.PLAYLIST_RADIO
        : STATION_TYPE.COLLECTION;
      return {
        ...playlist,
        seedType: stationType,
        stationType,
        type: stationType,
      };
    }),
);

export const getShuffledTrackIds = (
  state: State,
  {
    seedId,
  }: {
    seedId: string;
  },
) =>
  get(
    state,
    ['playlist', 'playlists', seedId, 'shuffledTracks'],
    [],
  ) as Array<Track>;

export const getShuffledTracks = createSelector(
  getFullTracks,
  getShuffledTrackIds,
  (tracks, ids) =>
    ids
      .filter(({ removed }) => !removed)
      .map(({ trackId }) => tracks[trackId])
      .filter(track => track),
);

export const getMyPlaylist: Selector<Playlist | undefined> = createSelector(
  getPlaylists,
  getMyPlaylistId,
  (playlists, myPlaylistId) => playlists[myPlaylistId],
);

export const getReceivedPlaylists: Selector<boolean> = createSelector(
  getPlaylistState,
  state => get(state, 'receivedPlaylists', false),
);

export const getNextPageKey = createSelector<
  RootState,
  State,
  string | null | undefined
>(getPlaylistState, state => get(state, 'nextPageKey', undefined));
