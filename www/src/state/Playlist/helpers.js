import PlaylistTypes from 'constants/playlistTypes';
import UrlParse from 'url-parse';
import {
  addOps,
  buildImageUrl,
  buildUrl,
  encodeMediaServerSecureUrl,
  removeParam,
  urlHasParam,
} from 'utils/mediaServerImageMaker/mediaServerImageUrl';
import {
  blur,
  buildOpsString,
  fit,
  maxcontain,
  tile,
  urlOps,
} from 'utils/mediaServerImageMaker/opsString';
import { COLLECTION_TYPES } from 'constants/stationTypes';
import { emptyPlaylist } from 'constants/assets';
import { get, identity, merge } from 'lodash-es';
import { REQUEST_STATE } from './constants';

export function isPlaylist(types) {
  return COLLECTION_TYPES.includes(types);
}

export function encodePlaylistSeedId(userId, playlistId) {
  if (!playlistId) return '';
  if (playlistId.indexOf('/') > -1) return playlistId;
  return `${userId}/${playlistId}`;
}

export function decodePlaylistSeedId(seedId) {
  if (seedId.indexOf('/') === -1) {
    return { playlistId: seedId };
  }
  const [userId, playlistId] = seedId.split('/');
  return { playlistId, userId };
}

export function getPlaylistIdFromSlug(slug = '') {
  if (typeof slug !== 'string') return {};

  const [owner, id] = slug.split('-').slice(-2);

  return {
    id: id?.replace(/\/*/g, ''),
    owner: owner?.replace(/\/*/g, ''),
  };
}

export function receivePlaylists(
  state,
  playlists,
  requestState = REQUEST_STATE.FETCHED,
  nextPageKey = undefined,
) {
  let myPlaylistId = state.myPlaylist;
  if (!myPlaylistId) {
    const myPlaylist = playlists.find(
      ({ playlistType }) => playlistType === PlaylistTypes.Default,
    );
    myPlaylistId =
      myPlaylist ?
        encodePlaylistSeedId(
          get(myPlaylist, 'ownerId'),
          get(myPlaylist, 'playlistId'),
        )
      : '';
  }

  return {
    nextPageKey,
    playlists: playlists.reduce(
      (map, current) => {
        const encodedId = encodePlaylistSeedId(
          current.ownerId,
          current.playlistId,
        );

        return {
          ...map,
          [encodedId]: merge(
            {},
            get(state, ['playlists', encodedId], { requestState, thumbs: {} }),
            current,
          ),
        };
      },
      merge({}, state.playlists),
    ),
    ...(myPlaylistId ? { myPlaylist: myPlaylistId } : {}),
  };
}

export function getPlaylistUrl({ slug, playlistId, userId }) {
  return `/playlist/${slug}-${userId}-${playlistId}`;
}

export function getDefaultCollectionImageUrl(
  { mediaServerUrl, siteUrl },
  { width = null, blurSigma = null },
) {
  return buildImageUrl(
    buildUrl({ mediaServerUrl, siteUrl }, emptyPlaylist),
    addOps(
      buildOpsString(
        width ? fit(width, width) : identity,
        blurSigma ? blur(blurSigma) : identity,
      )(),
    ),
  )(new UrlParse(emptyPlaylist));
}

export function getCollectionImageUrl(
  { mediaServerUrl, siteUrl },
  { width, blurSigma = null },
  url,
) {
  if (!url)
    return getDefaultCollectionImageUrl(
      { mediaServerUrl, siteUrl },
      { blurSigma, width },
    );
  return buildImageUrl(
    buildUrl({ mediaServerUrl, siteUrl }, url),
    removeParam('tile(2,2)'),
    addOps(
      buildOpsString(
        width ? fit(width, width) : identity,
        urlOps(url),
        urlHasParam(url, 'tile(2,2)') ? tile(2) : identity,
        blurSigma ? blur(blurSigma) : identity,
      )(),
    ),
  )();
}

export function getCollectionImageUrlMeta({ mediaServerUrl, siteUrl }, url) {
  if (!url)
    return getDefaultCollectionImageUrl(
      { mediaServerUrl, siteUrl },
      { width: 1200 },
    );
  const imgUrl = buildImageUrl(
    encodeMediaServerSecureUrl(mediaServerUrl),
    removeParam('fit'),
    addOps(buildOpsString(maxcontain(1200, 630), identity)()),
  )(url);
  return imgUrl;
}

/**
 * reorderOpsMergeParam
 * Playlist directory response includes a merge param for 2x2 playlist images, this is causing a
 * "zoom" behavior from MediaServer. This method strips out ONLY the merge op and leaves the rest
 * intact. There is a ticket in AMP's queue to fix this that issue, but this is a temporary
 * workaround [DEM 03/10/2022]
 * @param {string} imageUrl - Media Server image URL
 * @returns string
 */
function reorderOpsMergeParam(imageUrl) {
  const queryIndex = imageUrl.indexOf('?');
  let opsArray = [];
  let hasFit = false;
  if (queryIndex > -1) {
    const queryString = imageUrl.slice(queryIndex + 1);
    const searchParams = new URLSearchParams(queryString);
    if (searchParams.has('ops')) {
      const opsString = decodeURIComponent(searchParams.get('ops'));
      if (opsString.toLocaleLowerCase().includes('fit')) {
        hasFit = true;
      }
      // split only on commas that are NOT inside parentheses
      opsArray = opsString.split(/,(?![^(]*\))/);
      opsArray.sort((a, b) => {
        const op1 = a.trim().toUpperCase();
        const op2 = b.trim().toUpperCase();

        if (op1.includes('FIT')) {
          // always sort FIT at the head of the array
          return -1;
        } else if (op2.includes('MERGE')) {
          // always sort MERGE at the tail of the array
          return 1;
        }

        // otherwise, just natural sort
        if (op1 < op2) {
          return -1;
        }
        if (op1 > op2) {
          return 1;
        }
        return 0;
      });

      // if no FIT param, add to the head of the array
      if (!hasFit) {
        opsArray.unshift('fit(480,480)');
      }
    }

    const url = imageUrl.slice(0, queryIndex);
    const newSearchParams = new URLSearchParams({ ops: opsArray.join(',') });
    return `${url}?${newSearchParams.toString()}`;
  } else {
    // no query string, just return the url
    return imageUrl;
  }
}

export function formatPlaylistRecs(recs) {
  return recs.reduce((result, rec, index) => {
    const { meta, item } = rec;
    const {
      id,
      urls: { image: imageUrl, web: subCategoryLink },
      name: title,
      description: subtitle,
      id: seedId,
      slug,
      userId,
    } = item;
    const { contentType: seedType } = meta;
    const url = slug.includes(String(seedId)) ? slug : `${slug}-${seedId}`;
    const formatedData = [
      ...result,
      {
        cardId: `/${id}`,
        category: {},
        children: [],
        id: { id, userId },
        isPlaylist: true,
        parent: [],
        playlistAttrs: null,
        position: index + 1,
        subCategoryLink,
        subCategoryUrl: {},
        subtitle,
        title,
        imageUrl: reorderOpsMergeParam(imageUrl),
        url,
        seedId,
        seedType,
      },
    ];
    return formatedData;
  }, []);
}
