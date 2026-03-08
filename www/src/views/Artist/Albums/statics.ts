import { artistAlbumsReceived } from 'state/Albums/actions';
import { artistProfileReceived, artistReceived } from 'state/Artists/actions';
import { getAmpUrl, getCountryCode } from 'state/Config/selectors';
import { getArtistAlbums } from 'state/Albums/services';
import { getArtistByArtistId, getArtistProfile } from 'state/Artists/services';
import { getCurrentArtistId } from 'state/Artists/selectors';
import { getSlugId } from 'state/Routing/selectors';
import { PAGE_TYPE } from 'constants/pageType';
import { setHasHero } from 'state/Hero/actions';
import { STATION_TYPE } from 'constants/stationTypes';
import type { GetAsyncData, State } from 'state/types';

export const getAsyncData: GetAsyncData =
  () =>
  async (dispatch, getState, { transport }) => {
    const state = getState();
    const ampUrl = getAmpUrl(state);
    const countryCode = getCountryCode(state);
    const id = getSlugId(state);

    const [artistByIdRes, artistProfileRes, artistAlbumsRes] =
      await Promise.all([
        transport(getArtistByArtistId({ ampUrl, artistId: id, countryCode })),
        transport(getArtistProfile({ ampUrl, id })),
        transport(getArtistAlbums({ ampUrl, id })),
      ]);

    const artistById = artistByIdRes?.data?.artist;
    const artistProfile = artistProfileRes?.data;
    const artistAlbums = artistAlbumsRes?.data;

    dispatch(artistReceived([artistById]));
    dispatch(artistProfileReceived(artistProfile));
    dispatch(setHasHero(false));
    dispatch(artistAlbumsReceived(artistById?.artistId, artistAlbums));
  };

export function pageInfo(state: State) {
  const pageId = getCurrentArtistId(state);

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
