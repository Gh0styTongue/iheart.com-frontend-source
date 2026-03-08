import { CCR_CONTENT } from 'constants/ccrContent';
import { genresReceived } from 'state/Genres/actions';
import { getAmpUrl } from 'state/Config/selectors';
import {
  getCurrentArtistDirectoryGenre,
  getReceivedGenres,
} from 'state/Genres/selectors';
import { getCurrentArtistDirectoryRecs } from 'state/Recs/selectors';
import { getGenreRecs } from 'state/Recs/services';
import { getGenres } from 'state/Genres/services';
import { getSlugOrId } from 'state/Routing/selectors';
import { MOST_POPULAR_ARTISTS_CATEGORY_ID } from 'state/Recs/constants';
import { PAGE_TYPE } from 'constants/pageType';
import { recsReceived } from 'state/Recs/actions';
import { setHasHero } from 'state/Hero/actions';
import { slugify } from 'utils/string';
import { State } from 'state/buildInitialState';
import { Thunk } from 'state/types';

export function getAsyncData(): Thunk<Promise<void>> {
  return async function thunk(dispatch, getState, { transport }) {
    dispatch(setHasHero(false));

    const state = getState();
    const currentArtistDirectoryRecs = getCurrentArtistDirectoryRecs(state);
    const receivedGenres = getReceivedGenres(state);

    if (currentArtistDirectoryRecs.length && receivedGenres) return;

    const ampUrl = getAmpUrl(state);
    const slugOrId = getSlugOrId(state);

    // The custom & picker genreTypes only differ in the image they return. B/c we don't use the images
    // from custom, we can request picker here to avoid messing up the images in the genre game
    const { data } = await transport(
      getGenres({ ampUrl, genreType: 'picker' }),
    );
    const genre = data.genres.find(
      ({ genreName }: any) => slugify(genreName) === slugOrId,
    );
    const id = genre && genre.id ? genre.id : MOST_POPULAR_ARTISTS_CATEGORY_ID;

    const { data: recs } = await transport(
      getGenreRecs({
        ampUrl,
        genreId: id,
        ops: { limit: 40, template: 'CR' },
      }),
    );

    dispatch(genresReceived(data.genres));
    dispatch(recsReceived({ id, recs: recs.values, type: 'artist' }));
  };
}

export function pageInfo(state: State) {
  const genre = getCurrentArtistDirectoryGenre(state);
  return {
    pageId: genre.id,
    pageType: PAGE_TYPE.ARTIST_DIRECTORY,
    targeting: {
      ccrcontent1: CCR_CONTENT.DIRECTORY_ARTIST,
    },
  };
}
