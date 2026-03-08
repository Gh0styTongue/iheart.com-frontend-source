// # Object Mappers
// Map AMP response object to our type

/**
 * @module utils/mapper
 */
import {
  buildCatalogUrl,
  buildImageUrl,
} from '../../src/utils/mediaServerImageMaker/mediaServerImageUrl';
import {
  getAlbumUrl,
  getArtistUrl,
  getFavoritesRadioUrl,
  getFeaturedUrl,
  getLiveUrl,
  getTrackUrl,
} from 'utils/url';
import { getPodcastEpisodeUrl, getPodcastUrl } from 'state/Podcast/helpers';
import { merge } from 'lodash-es';
import { STATION_TYPE } from 'constants/stationTypes';

/**
 * Maps a data object into an abstract station POJO.
 * @param  {Object} data Data object
 * @return {Object}      Station object with at least `id`, `name`, `rawLogo`, `seedType`, `seedId` & `thumbs`.
 */
export function mapStation(data) {
  const seedType =
    data.seedType || data.type || data.stationType?.toLowerCase();

  let { seedId } = data;

  if (seedType === STATION_TYPE.FAVORITES) {
    if (!data.seedId && data.slug) {
      // right now AMP isn't returning seedId, can remove when they do
      const split = data.slug.split('-');
      seedId = +split[split.length - 1];
    }
  } else {
    seedId = seedId || data.id;
  }

  return merge({}, data, {
    artist: data.artistName || data.artist,
    imagePath: data.imagePath || data.image,
    name: data.title || data.name,
    playlist: data.playlist || [],
    rawLogo: data.logo,
    seedId,
    seedType,
    thumbs: data.thumbs || {},
  });
}

function getFavoritesRadioName(name) {
  if (!name) return undefined;
  if (name.indexOf(' Favorites Radio') > 0) return name;
  return `${name} Favorites Radio`;
}

export function mapSeedStation(stationData, mediaServerUrl = null) {
  let data = { ...stationData };

  if (data.seedType === STATION_TYPE.LIVE || data.markets) {
    const liveId = data.seedId || data.id;
    data = merge({}, data, {
      rawLogo: data.logo,
      seedId: liveId,
      seedType: STATION_TYPE.LIVE,
      url: getLiveUrl(liveId, data.name),
    });
  } else if (data.trackId || data.seedType === STATION_TYPE.TRACK) {
    data = merge({}, data, {
      name: data.name || data.title,
      rawLogo: data.imagePath,
      seedId: data.seedId || data.trackId,
      seedType: STATION_TYPE.TRACK,
      url: getTrackUrl(data.artistId, data.artist, data.seedId, data.name),
    });
  } else if (data.albumId || data.seedType === STATION_TYPE.ALBUM) {
    data = merge({}, data, {
      name: data.name || data.title,
      rawLogo: data.imagePath,
      seedId: data.seedId || data.albumId,
      seedType: STATION_TYPE.ALBUM,
      url: getAlbumUrl(data.artistId, data.artist, data.seedId, data.title),
    });
  } else if (data.artistId || data.seedType === STATION_TYPE.ARTIST) {
    data = merge({}, data, {
      name: data.name || data.artistName,
      rawLogo: data.link,
      seedId: data.seedId || data.artistId,
      seedType: STATION_TYPE.ARTIST,
      url: getArtistUrl(data.seedId, data.name),
    });
  } else if (data.seedType === STATION_TYPE.FAVORITES) {
    let seedId = data.seedId || data.id;
    let stationName;
    let favoritesCatalogImage = null;

    if (data.slug) {
      const tempArr = data.slug.split('-');
      if (!seedId) {
        const num = +tempArr[tempArr.length - 1];
        if (!Number.isNaN(num)) {
          seedId = num;
        }
      }
      if (!data.name) {
        stationName = tempArr.slice(0, tempArr.length - 1).join(' ');
      }
    }

    if (mediaServerUrl) {
      favoritesCatalogImage = buildImageUrl(
        buildCatalogUrl(mediaServerUrl, {
          id: seedId,
          resourceType: 'favorites',
        }),
      )();
    }

    data = merge({}, data, {
      imgUrl:
        favoritesCatalogImage ||
        data.imagePath ||
        data.imageUrl ||
        'https://web-static.pages.iheart.com/img/default_favorite.png',
      name: stationName || getFavoritesRadioName(data.name),
      rawLogo:
        favoritesCatalogImage ||
        data.imagePath ||
        data.imageUrl ||
        'https://web-static.pages.iheart.com/img/default_favorite.png',
      seedId,
      seedType: STATION_TYPE.FAVORITES,
      username: data.name,
    });
  } else if (data.seedType === STATION_TYPE.FEATURED || data.artists) {
    data = merge({}, data, {
      ...data,
      rawLogo: data.imagePath,
      seedId: data.seedId || data.id,
      url: getFeaturedUrl(data.slug || data.seedId),
    });
  } else if (data.seedType === STATION_TYPE.PODCAST || data.allepisodes) {
    data = merge({}, data, {
      name: data.name || data.title,
      rawLogo: data.imagePath,
      seedId: data.seedId || data.id,
      url: getPodcastUrl(data.seedId, data.slug),
    });
  } else if (data.seedType === STATION_TYPE.TALK_EPISODE || data.episodeId) {
    data = merge({}, data, {
      name: data.title,
      url: getPodcastEpisodeUrl(
        data.showId,
        data.showSlug,
        data.episodeId,
        data.title,
      ),
    });
  }

  return data;
}

/**
 * Maps a data object into a Live station POJO.
 * @param  {Object} data Data object
 * @return {Object}      Live Station object with at least `id`, `name`, `type`,
 * `url`, `rawLogo`, `seedType`, `seedId`, `thumbs` & `primaryMarket`. `primaryMarket` might not exist
 * if this station doesn't have it, which should actually be an Error of some sort.
 */
export function mapLiveStation(stationData) {
  let data = mapStation(stationData);
  data = merge({}, data, {
    seedId: Number(data.id || data.seedId),
    seedType: 'live',
    type: 'live',
    url: getLiveUrl(data.id, data.name),
  });

  if (data.markets && data.markets.length) {
    data.primaryMarket = data.markets[0]; // eslint-disable-line
    data.state = data.primaryMarket.stateAbbreviation;
  }

  return data;
}

/**
 * Maps a data object into a Custom station POJO.
 * @param  {Object} data Data object
 * @return {Object}      Custom Station object with at least `id`, `name`, `type`,
 * `url`, `rawLogo`, `seedType`, `seedId` & `thumbs`.
 */
export function mapCustomStation(stationData) {
  let data = mapStation(stationData);
  data.type = 'custom';

  // Try to figure out what the `seedType` & `seedId` should be
  if (data.seedTrackId || data.trackId) {
    data = merge({}, data, {
      name: data.artistName,
      seedId: data.seedTrackId || data.trackId,
      seedType: 'track',
      url: getTrackUrl(
        data.seedArtistId || data.artistId,
        data.artistName,
        data.seedTrackId || data.trackId,
        data.name,
      ),
    });
  } else if (data.seedArtistId || data.artistId) {
    data = merge({}, data, {
      name: data.name || data.artistName,
      radioId: data.id,
      seedId: data.seedArtistId || data.artistId,
      seedType: 'artist',
      url: getArtistUrl(data.seedArtistId || data.artistId, data.artistName),
    });
  } else if (data.seedFeaturedStationId) {
    data = merge({}, data, {
      seedId: data.seedFeaturedStationId,
      seedType: STATION_TYPE.FEATURED,
      url: getFeaturedUrl(data.seedFeaturedStationId),
    });
  } else if (data.seedType === STATION_TYPE.FAVORITES) {
    data.id = data.id || data.seedId;
    data.name = getFavoritesRadioName(data.name);
    data.url = getFavoritesRadioUrl(data.slug);
  }

  return data;
}

/**
 * Maps a data object into a Talk station POJO.
 * @param  {Object} data Data object
 * @return {Object}      Talk Station object with at least `id`, `name`, `type`,
 * `url`, `rawLogo`, `seedType`, `seedId`, `thumbs` & `episodes`.
 */
export function mapTalkStation(stationData) {
  let data = mapCustomStation(stationData);

  data = merge({}, data, {
    episodes: [],
    name: data.name || data.title,
    type: 'talk',
  });

  // Try to figure out what the `seedType` & `seedId` should be
  if (data.seedShowId || data.allepisodes) {
    const slug = data.showSlug || data.slug;
    const id = data.seedShowId || data.id;
    data = merge({}, data, {
      ...data,
      seedId: id,
      seedType: 'podcast',
      showUrl: data.url,
      url: getPodcastUrl(id, slug),
    });
  }

  return data;
}

/**
 * Maps data object into a Track POJO
 * @param  {Object} data Data object
 * @return {Object}      Track object with `id`, `duration`, `rawLogo`, `title`, `artist`, `artistId`, `albumId`, `album`,
 * `url`
 */
export function mapTrack(data) {
  return merge({}, data, {
    duration: data.trackDuration || data.duration,
    id: data.trackId || data.id,
    rawLogo: data.imagePath,
    url: getTrackUrl(
      data.artistId,
      data.artist || data.artistName,
      data.trackId,
      data.title,
    ),
  });
}

/**
 * Maps data into en Episode POJO
 * @param  {Object} data data object
 * @return {Object}      Episode object with `id`, `showId`, `show`, `title`, `description`, `rawLogo`,
 * `showSlug`, `url`
 */
export function mapEpisode(data) {
  return merge({}, data, {
    id: data.episodeId,
    rawLogo: data.image,
    show: data.showName,
    url: getPodcastEpisodeUrl(
      data.podcastId,
      data.podcastSlug,
      data.episodeId,
      data.title,
    ),
  });
}
