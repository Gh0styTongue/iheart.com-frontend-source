export const REQUEST_PLAYLIST_DIRECTORY =
  'iHR/PlaylistDirectory/REQUEST_PLAYLIST_DIRECTORY';
export const RECEIVE_PLAYLIST_DIRECTORY =
  'iHR/PlaylistDirectory/RECEIVE_PLAYLIST_DIRECTORY';
export const REJECT_PLAYLIST_DIRECTORY =
  'iHR/PlaylistDirectory/REJECT_PLAYLIST_DIRECTORY';

// collection types - taken from the api, but lowercased
const rootCollection = {
  collection: 'collections/playlist-directory',
  facets: null,
} as const;

export const SEED_CATEGORIES = {
  DECADES: {
    ...rootCollection,
    facets: 'facets/decades',
  },
  FEATURED: {
    ...rootCollection,
    facets: 'facets/featured-playlists',
  },
  GENRE: {
    ...rootCollection,
    facets: 'facets/genre-playlists',
  },
  MOODS_ACTIVITIES: {
    ...rootCollection,
    facets: 'facets/moods-activities',
  },
  ROOT: rootCollection,
} as const;
