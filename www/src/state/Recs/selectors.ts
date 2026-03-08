import {
  ArtistDirectoryGenre,
  getCurrentArtistDirectoryGenre,
} from 'state/Genres/selectors';
import {
  CAMPAIGN_IDS,
  FOR_YOU_CATEGORY_ID,
  PLAYLIST_RECS_CATEGORY_ID,
  PODCAST_RECS_CATEGORY_ID,
} from 'state/Recs/constants';
import { createSelector } from 'reselect';
import { get } from 'lodash-es';
import { getArtistUrl } from 'utils/url';
import { Rec, State } from './types';
import { State as RootState } from 'state/types';
import { showPlaylistSelector } from 'state/Entitlements/selectors';
import { TILE_RES } from 'components/MediaServerImage';

export const getCampaignId = createSelector(
  showPlaylistSelector,
  showPlaylists => {
    if (showPlaylists) {
      return CAMPAIGN_IDS.WITH_PLAYLISTS;
    }

    return CAMPAIGN_IDS.NO_PLAYLISTS;
    return CAMPAIGN_IDS.NO_PLAYLISTS;
  },
);

export const getRecsRoot = createSelector<RootState, RootState, State>(
  state => state,
  (state: any): State => get(state, 'recs', {}),
);

export const getCanLoadMore = createSelector<RootState, State, boolean>(
  getRecsRoot,
  root => root?.canLoadMore,
);

export const getArtistRecs = createSelector<
  RootState,
  State,
  Record<string, Array<Rec>>
>(getRecsRoot, root => get(root, 'artist', {}));

export const getCurrentArtistDirectoryRecs = createSelector<
  RootState,
  Record<string, Array<Rec>>,
  ArtistDirectoryGenre,
  Array<Rec & { name: string; seedId: number; seedType: string }>
>(getArtistRecs, getCurrentArtistDirectoryGenre, (recs, genre) =>
  (recs[genre.id] || []).map(({ content, ...rest }) => ({
    ...rest,
    imgWidth: TILE_RES,
    name: content!.name,
    seedId: content!.id,
    seedType: 'artist',
    url: getArtistUrl(content!.id, content!.name)!,
  })),
);

export const getGenresRecs = createSelector<
  RootState,
  State,
  Record<string, Array<Rec>>
>(getRecsRoot, root => get(root, 'genre', {}));

export const getForYouRecs = createSelector(getRecsRoot, root =>
  get(root, ['for-you', FOR_YOU_CATEGORY_ID], []),
);

export const getIsForYouRecsDefault = createSelector(getRecsRoot, root =>
  get(root, ['for-you', 'defaultRecs'], true),
);

export const getPodcastRecs = createSelector(getRecsRoot, root =>
  get(root, ['podcast', PODCAST_RECS_CATEGORY_ID, 'tiles'], []),
);

export const getPlaylistRecs = createSelector(getRecsRoot, root =>
  get(root, ['playlist', PLAYLIST_RECS_CATEGORY_ID, 'tiles'], []),
);
