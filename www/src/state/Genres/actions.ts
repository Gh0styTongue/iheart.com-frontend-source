import Events from 'modules/Analytics/constants/events';
import genreUpdate from 'modules/Analytics/helpers/genreUpdate';
import { Action, Thunk } from 'state/types';
import { Genre } from './types';
import { getAmpUrl } from 'state/Config/selectors';
import { getCredentials } from 'state/Session/selectors';
import { getGenres, getUserGenres, saveUserGenres } from './services';
import { getSelectedGenres } from 'state/Genres/selectors';
import { mapGenre } from 'state/Genres/shims';
import {
  RECEIVE_GENRE_SELECTED,
  RECEIVE_GENRES,
  SELECT_GENRE_REQUEST,
  UPDATE_GENRE_PREFERENCES,
} from './constants';

export function genresReceived(genreData: Array<Genre>) {
  return {
    payload: { genreData },
    type: RECEIVE_GENRES,
  };
}

export function genresRequest(genreType = 'picker'): Thunk<Promise<void>> {
  return (dispatch, getState, { transport }) => {
    const ampUrl = getAmpUrl(getState());

    return transport(getGenres({ ampUrl, genreType }))
      .then(({ data }) => data)
      .then(({ genres }) => genres.map(mapGenre))
      .then(genres => [...genres].sort((a, b) => (a.name >= b.name ? 1 : -1)))
      .then(genres => dispatch(genresReceived(genres)));
  };
}

export function receiveUserGenres(genres: Array<number>): Action<{
  [genreId: string]: true;
}> {
  return {
    meta: {
      analytics: {
        data: {
          user: {
            genreSelected: genres,
          },
        },
      },
    },
    payload: genres.reduce((map, genreId) => ({ ...map, [genreId]: true }), {}),
    type: RECEIVE_GENRE_SELECTED,
  };
}

export function fetchGenrePreferences(): Thunk<Promise<void>> {
  return async function thunk(dispatch, getState, { transport }) {
    const state = getState();
    const { profileId, sessionId } = getCredentials(state);
    if (profileId && sessionId) {
      const { data } = await transport(
        getUserGenres({ ampUrl: getAmpUrl(state), profileId, sessionId }),
      );

      const genres: Array<number> = data?.value?.genreIds ?? [];

      dispatch(receiveUserGenres(genres));
    }
  };
}

export function updateGenrePreferences(
  preferredGenres: Array<string>,
  rejectedGenres: Array<string>,
  updateType: 'update' | 'onboarding',
) {
  return {
    meta: {
      analytics: {
        data: genreUpdate({
          deselected:
            preferredGenres.length ? preferredGenres.join(',') : undefined,
          selected:
            rejectedGenres.length ? rejectedGenres.join(',') : undefined,
          type: updateType,
        }),
        event: Events.GenreUpdate,
      },
    },
    payload: preferredGenres.reduce(
      (map, genreId) => ({ ...map, [genreId]: true }),
      {},
    ),
    type: UPDATE_GENRE_PREFERENCES,
  };
}
export function saveGenrePreferences(
  genresSelected: {
    [key: string]: boolean;
  },
  updateType: 'update' | 'onboarding',
): Thunk<Promise<void>> {
  return async function thunk(dispatch, getState, { transport }) {
    const state = getState();
    const rejectedGenres = Object.keys(getSelectedGenres(state) || {}).filter(
      id => !genresSelected[id],
    );
    const preferredGenres = Object.keys(genresSelected).filter(
      id => genresSelected[id],
    );
    const { profileId, sessionId } = getCredentials(state);

    dispatch({
      meta: {
        analytics: {
          data: {
            user: {
              genreSelected: preferredGenres,
            },
          },
        },
      },
      type: SELECT_GENRE_REQUEST,
    });

    // IHRWEB-14971 - update genre taste endpoint for v3 tasteProfile
    const GenreNumbers = Array.from(preferredGenres, Number); // make an array of numbers
    await transport(
      saveUserGenres({
        ampUrl: getAmpUrl(state),
        genreIds: GenreNumbers,
        profileId: profileId!,
        sessionId: sessionId!,
        skipped: !Array.isArray(GenreNumbers) || !GenreNumbers.length, // GenreNumbers does not exist, is not an array, or is empty
      }),
    );
    return dispatch(
      updateGenrePreferences(preferredGenres, rejectedGenres, updateType),
    );
  };
}
