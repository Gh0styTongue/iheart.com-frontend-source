import { adsMeta } from 'state/Ads/services';
import { articlesLoaded } from 'state/News/actions';
import { artistAlbumsReceived } from 'state/Albums/actions';
import {
  artistProfileReceived,
  artistReceived,
  receiveArtistAdGenre,
} from 'state/Artists/actions';
import { CONTEXTS } from 'modules/Logger';
import {
  getAmpUrl,
  getCountryCode,
  getWebGraphQlUrl,
} from 'state/Config/selectors';
import { getArtistAlbums } from 'state/Albums/services';
import {
  getArtistByArtistId,
  getArtistData,
  getArtistProfile,
} from 'state/Artists/services';
import { getCurrentArtistId } from 'state/Artists/selectors';
import { getLocale } from 'state/i18n/selectors';
import { getSlugId } from 'state/Routing/selectors';
import { mapGraphQlResponse } from 'state/News/helpers';
import { PAGE_TYPE } from 'constants/pageType';
import { setHeroPremiumBackground } from 'state/Hero/actions';
import { STATION_TYPE } from 'constants/stationTypes';
import type { GetAsyncData, State } from 'state/types';

export const getAsyncData: GetAsyncData =
  () =>
  async (dispatch, getState, { transport, logger }) => {
    const state = getState();
    const ampUrl = getAmpUrl(state);
    const countryCode = getCountryCode(state);
    const graphQlUrl = getWebGraphQlUrl(state);
    const id = getSlugId(state);
    const locale = getLocale(state);

    if (Number.isNaN(parseInt(id, 10))) {
      const errObj = new Error(`invalid id: ${id}`);
      logger.error(
        [CONTEXTS.ROUTER, CONTEXTS.ARTIST],
        errObj.message,
        {},
        errObj,
      );
      return { notFound: true };
    }

    let gqlData: any = {};

    try {
      ({ data: gqlData } = await transport(
        getArtistData({ articles: 3, baseUrl: graphQlUrl, id, locale }),
      ));
    } catch (error: any) {
      const errObj =
        error instanceof Error ? error : new Error(error.statusText ?? 'error');
      logger.error(
        [CONTEXTS.ROUTER, CONTEXTS.ARTIST, CONTEXTS.NEWS],
        errObj.message,
        {},
        errObj,
      );
    }

    const { data: artistData } = await transport(
      getArtistByArtistId({ ampUrl, artistId: id, countryCode }),
    );
    const { data: artistProfile } = await transport(
      getArtistProfile({ ampUrl, id }),
    );
    const { data: artistAlbums } = await transport(
      getArtistAlbums({ ampUrl, id }),
    );
    const { data: artistAdGenre } = await transport(adsMeta(ampUrl, id));

    const artist = artistData?.artist ?? null;

    if (!artist) return { notFound: true };

    const { content, leads } = gqlData?.data?.artist ?? {};
    const articles = (content ?? []).map(mapGraphQlResponse);
    const backgroundColor = leads?.[0]?.backgroundColor ?? '';
    const primaryBackgroundSrc = leads?.[0]?.primaryBackgroundSrc ?? '';

    dispatch(artistProfileReceived(artistProfile));
    dispatch(artistReceived([artist]));
    dispatch(
      setHeroPremiumBackground(primaryBackgroundSrc, backgroundColor, true),
    );
    dispatch(articlesLoaded(articles, 'artist', artist.artistId));
    dispatch(artistAlbumsReceived(artist.artistId, artistAlbums));
    dispatch(receiveArtistAdGenre(artist.artistId, artistAdGenre));
    return undefined;
  };

export function pageInfo(state: State) {
  const pageId = getCurrentArtistId(state);

  return {
    pageId,
    pageType: PAGE_TYPE.ARTIST,
    stationType: STATION_TYPE.CUSTOM,
    targeting: {
      name: pageId ? 'artist' : 'directory:artist',
      modelId: pageId ? String(pageId) : 'directory:artist:home',
    },
  };
}
