import logger, { CONTEXTS } from 'modules/Logger';
import safeStringify from 'utils/safeStringify';
import { extractQSAsObject } from 'utils/queryStrings';
import { get, set, setWith } from 'lodash-es';
import { SEED_CATEGORIES } from 'state/PlaylistDirectory/constants';

export function getPlaylistAttrsOrNull({ id: idString, kind } = {}, link) {
  if (!idString) return null;

  const url = link.split('-');
  const id = url.pop().replace(/\//g, '');
  const userId = url.pop();
  const isCurated = kind === 'curated';

  if (!id || !userId) return null; // no playlist id!  must not be a playlist.

  return {
    id,
    isCurated,
    userId,
  };
}

export function getId(playlistAttrs, category) {
  if (playlistAttrs !== null) {
    const { id, userId } = playlistAttrs;
    return { id, userId };
  }
  return category;
}

export function getCategoryPair(href) {
  const { collection = null, facets = null } = extractQSAsObject(href);
  return collection === null && facets === null ? null : { collection, facets };
}

export function convertPublishFacetToParentCategory({ collection, facet }) {
  return { collection, facets: facet };
}

export function parseApiCard({
  catalog,
  id: cardId,
  img_uri, // eslint-disable-line camelcase
  link: {
    urls: { web },
  },
  position,
  publish_facets: publishFacets, // category info
  subtitle,
  title,
}) {
  const realPublishFacets = publishFacets || [];

  const playlistAttrs = !catalog ? null : getPlaylistAttrsOrNull(catalog, web);
  const category = getCategoryPair(web);

  const facets = publishFacets[0]?.facet?.split('/')[1];
  const categoryCollectionFacets = {
    ...category,
    collection: `collections/${facets}`,
  };
  const isPlaylist = !!playlistAttrs;

  if (!publishFacets) {
    const errObj = new Error(
      `${
        isPlaylist ? 'playlist' : 'category'
      } card returned by server does not contain a publish_facets field.  Please report to radioEdit.`,
    );
    logger.error([CONTEXTS.PLAYLIST], errObj.message, { cardId }, errObj);
  }
  return {
    cardId,
    category,
    children: !isPlaylist ? [] : null,
    id: getId(playlistAttrs, categoryCollectionFacets),
    imageUrl: img_uri, // eslint-disable-line camelcase
    isPlaylist,
    parents: realPublishFacets.map(convertPublishFacetToParentCategory),
    playlistAttrs,
    position,
    subCategoryLink: web,
    subCategoryUrl: getId(playlistAttrs, category),
    subtitle,
    title,
  };
}

export function addCategoryToState(state, tile) {
  if (get(tile, 'isPlaylist')) {
    return state;
  }

  const id = safeStringify(get(tile, 'id'));

  const oldTile = get(state, id);
  if (oldTile) {
    return setWith(
      state,
      id,
      set(tile, 'children', get(oldTile, 'children')),
      Object,
    );
  }

  return setWith(state, id, tile, Object);
}

export function addChildToParents(state, tile) {
  const id = safeStringify(get(tile, 'id'));
  const isPlaylist = get(tile, 'isPlaylist');
  const tileIdObj = { id, isPlaylist };
  const parents = get(tile, 'parents');

  return parents.reduce((memo, parentId) => {
    const parent = memo[safeStringify(parentId)] || { children: [] };
    const children = get(parent, 'children');
    const newChildren = children.concat(tileIdObj);

    return {
      ...memo,
      [safeStringify(parentId)]: set({ ...parent }, 'children', newChildren),
    };
  }, state);
}

export function getSubCategoryUrl(categoryMap) {
  if (
    !categoryMap ||
    get(categoryMap, 'collection') ===
      get(SEED_CATEGORIES, ['ROOT', 'collection'])
  ) {
    return '/playlist/';
  }
  const encodedCollection = get(categoryMap, 'collection');
  const encodedFacets = get(categoryMap, 'facets');
  return `/playlist/${encodedCollection}/${encodedFacets}`;
}
