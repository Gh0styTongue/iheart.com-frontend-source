import { artistProfileReceived, artistReceived } from 'state/Artists/actions';
import { getAmpUrl, getCountryCode } from 'state/Config/selectors';
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

    const { data: artistById } = await transport(
      getArtistByArtistId({ ampUrl, artistId: id, countryCode }),
    );
    const { data: artistProfile } = await transport(
      getArtistProfile({ ampUrl, id }),
    );

    const { artist }: any = artistById ?? {};

    dispatch(artistReceived([artist]));
    dispatch(artistProfileReceived(artistProfile));
    dispatch(setHasHero(false));
  };

export function pageInfo(state: State) {
  const pageId = getCurrentArtistId(state);

  return {
    pageId,
    pageType: PAGE_TYPE.ARTIST,
    stationType: STATION_TYPE.CUSTOM,
    targeting: {
      name: 'artist',
      modelId: String(pageId),
    },
  };
}
