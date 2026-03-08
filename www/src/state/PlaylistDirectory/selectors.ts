import safeStringify from 'utils/safeStringify';
import { Category, Playlist, State } from './types';
import { createSelector } from 'reselect';
import { get } from 'lodash-es';
import { getParams } from 'state/Routing/selectors';
import { getSubCategoryUrl } from './helpers';
import { joinPathComponents } from 'utils/canonicalHelpers';
import { State as RootState, Selector } from 'state/types';

export const getPlaylistDirectory: Selector<State> = createSelector(
  state => state,
  state => get(state, 'playlistDirectory', {}),
);

const getProps = (state: any, props: any): any => props;

export const getCategoryParam: Selector<Category> = createSelector(
  getParams,
  params => ({
    collection: `collections/${params.collection}`,
    facets: `${params.category}/${params.subcategory}`,
  }),
);

export const getCurrentCollection: Selector<string> = createSelector(
  getCategoryParam,
  ({ collection }) => collection,
);

export const getCurrentFacet: Selector<string> = createSelector(
  getCategoryParam,
  ({ facets }) => facets,
);

export const getCategoryProp: Selector<Category> = createSelector(
  getProps,
  getCategoryParam,
  (props, paramCategory) => props?.category || paramCategory,
);

export const getPlaylistTiles: Selector<State['playlistTiles']> =
  createSelector(getPlaylistDirectory, playlistDirectory => {
    const tiles = get(playlistDirectory, 'playlistTiles');
    const mappedTiles: Record<string, Playlist> = {};

    Object.keys(tiles).forEach(key => {
      const tile = tiles[key];
      const [, ...link] = get(tile, 'subCategoryLink').split('com');

      mappedTiles[key] = {
        ...tile,
        subCategoryLink: link.join('com'),
      };
    });

    return mappedTiles;
  });

export const getCategories: Selector<State['categories']> = createSelector(
  getPlaylistDirectory,
  playlistDirectory => {
    const categories = playlistDirectory?.categories;
    const mappedCategories: Record<string, Playlist> = {};

    Object.keys(categories).forEach(key => {
      const category = categories[key];

      mappedCategories[key] = {
        ...category,
        subCategoryLink: getSubCategoryUrl(category?.subCategoryUrl),
      };
    });

    return mappedCategories;
  },
);

export const getCategory = createSelector(
  [getCategories, getCategoryProp],
  (categoryLists, category) =>
    get(categoryLists, safeStringify(category), {
      children: [] as Array<Category>,
    }),
);

export const getCardId: Selector<string> = createSelector(
  getCategory,
  category => get(category, 'cardId', ''),
);

export const getCategoryTitle: Selector<string> = createSelector(
  getCategory,
  category => get(category, 'title', ''),
);

export function makeGetTilesByCategory(): Selector<Array<Playlist>> {
  return createSelector(
    [getCategories, getPlaylistTiles, getCategory],
    (categories, playlistTiles, category) => {
      const children = get(category, 'children');

      return children.map(tileIdObj => {
        if (get(tileIdObj, 'isPlaylist'))
          return get(playlistTiles, get(tileIdObj, 'id'));
        return get(categories, get(tileIdObj, 'id'));
      });
    },
  );
}

export function makePlaylistDirectoryPath(
  playlistCollection: string,
  playlistFacet: string,
): string | null {
  return !playlistCollection || !playlistFacet ?
      null
    : joinPathComponents('/playlist/', playlistCollection, playlistFacet);
}

export const getPlaylistDirectoryPath = createSelector<
  RootState,
  string,
  string,
  string | null
>(getCurrentCollection, getCurrentFacet, makePlaylistDirectoryPath);
