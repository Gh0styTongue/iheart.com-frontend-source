import { albumReceived } from 'state/Albums/actions';
import { artistReceived } from 'state/Artists/actions';
import { CONTEXTS } from 'modules/Logger';
import { getAlbumByIdV3 } from 'state/Albums/services';
import { getAmpUrl, getCountryCode } from 'state/Config/selectors';
import { getArtistByArtistId } from 'state/Artists/services';
import { getCurrentTrackId } from 'state/Tracks/selectors';
import { getSectionId, getSlugId } from 'state/Routing/selectors';
import { makeArtistAlbumPath, makeArtistPath } from 'state/Artists/selectors';
import { PAGE_TYPE } from 'constants/pageType';
import { setForce404data } from 'state/Routing/actions';
import { setHasHero } from 'state/Hero/actions';
import { STATION_TYPE } from 'constants/stationTypes';
import type { AxiosResponse } from 'axios';
import type { GetAsyncData, State } from 'state/types';

export const getAsyncData: GetAsyncData = () => {
  return async function thunk(dispatch, getState, { logger, transport }) {
    const state = getState();
    const albumId = getSectionId(state);
    const ampUrl = getAmpUrl(state);
    const artistId = getSlugId(state);
    const countryCode = getCountryCode(state);

    let artistData;
    let albumData;

    try {
      [artistData, albumData] = await Promise.allSettled([
        artistId ?
          transport(getArtistByArtistId({ ampUrl, artistId, countryCode }))
        : Promise.resolve({}),
        albumId ?
          transport(getAlbumByIdV3({ albumId, ampUrl }))
        : Promise.resolve({}),
      ]);
    } catch (e) {
      logger.error([CONTEXTS.ALBUM, 'getAsyncData'], e);
      // IHRWEB-12508 - don't redirect to artist if there is no artist profile
      return {
        notFound: true,
        force404: !artistData || artistData?.status === 'rejected',
      };
    }

    const artist = (artistData as PromiseFulfilledResult<AxiosResponse<any>>)
      ?.value?.data?.artist;
    const album = (albumData as PromiseFulfilledResult<AxiosResponse<any>>)
      ?.value?.data;

    if (!artist || !album) {
      let suggestedTitle;
      let suggestedUrl;
      if (album) {
        suggestedTitle = `${album?.title} by ${album?.artistName}`;
        const artistPath =
          makeArtistPath(album?.artistName, album?.artistId) ?? null;
        suggestedUrl =
          makeArtistAlbumPath(artistPath, album?.title, album?.albumId) ??
          undefined;
      } else if (artist) {
        suggestedTitle = artist?.artistName;
        suggestedUrl =
          makeArtistPath(artist?.artistName, artist?.artistId) ?? null;
      } else {
        suggestedTitle = 'Artist Directory';
        suggestedUrl = '/artist/';
      }
      dispatch(setForce404data({ suggestedTitle, suggestedUrl }));
      return { notFound: true, force404: true };
    }

    dispatch(artistReceived([artist ?? {}]));
    dispatch(albumReceived(album));
    return dispatch(setHasHero(true));
  };
};

export function pageInfo(state: State) {
  const pageId = getCurrentTrackId(state);
  return {
    pageId,
    pageType: PAGE_TYPE.ARTIST,
    stationType: STATION_TYPE.CUSTOM,
    targeting: {
      name: 'albums',
      modelId: String(pageId),
    },
  };
}
