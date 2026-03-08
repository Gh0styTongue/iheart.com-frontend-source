import {
  addOps,
  buildImageUrl,
  buildUrl,
} from 'utils/mediaServerImageMaker/mediaServerImageUrl';
import {
  buildOpsString,
  fit,
  gravity,
} from 'utils/mediaServerImageMaker/opsString';
import { getSiteDataIdByGenreId, SITE_IDS } from '../shims';
import { slugify } from 'utils/string';
import { THUMB_FIT } from 'components/MediaServerImage';
import type { Genre } from 'state/Genres/types';

export function getGenreUrl(id: number, name: string) {
  if (!id) {
    return null;
  }

  return `/genre/${slugify(name.toLowerCase())}-${id}/`;
}

export function mapGenres(
  { siteUrl, mediaServerUrl }: { siteUrl: string; mediaServerUrl: string },
  genres: Array<Genre> = [],
) {
  return genres.map(({ name, id, logo, ...rest }: Genre) => ({
    id,
    imgSrc: buildImageUrl(
      buildUrl({ mediaServerUrl, siteUrl }, logo),
      addOps(buildOpsString(gravity('center'), fit(...THUMB_FIT))()),
    )(),
    logo,
    name,
    url: getGenreUrl(id, name),
    ...rest,
  }));
}

export function genreMapper(
  id: number | string,
  data: { genres: Array<Genre> },
) {
  const { genres = [] } = data;
  return {
    currentId: id,
    genres: genres.map(genre => ({
      ...genre,
      siteId: getSiteDataIdByGenreId(genre.id as keyof typeof SITE_IDS),
    })),
  };
}
