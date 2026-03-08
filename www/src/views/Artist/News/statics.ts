import { articlesLoaded } from 'state/News/actions';
import { artistReceived } from 'state/Artists/actions';
import { CONTEXTS } from 'modules/Logger';
import {
  getAmpUrl,
  getCountryCode,
  getWebGraphQlUrl,
} from 'state/Config/selectors';
import { getArtistByArtistId, getArtistData } from 'state/Artists/services';
import { getCurrentArtistId } from 'state/Artists/selectors';
import { getLocale } from 'state/i18n/selectors';
import { getSlugId } from 'state/Routing/selectors';
import { mapGraphQlResponse } from 'state/News/helpers';
import { PAGE_TYPE } from 'constants/pageType';
import { setForce404data } from 'state/Routing/actions';
import { State } from 'state/buildInitialState';
import { STATION_TYPE } from 'constants/stationTypes';
import type { GetAsyncData } from 'state/types';

export const getAsyncData: GetAsyncData =
  () =>
  async (dispatch, getState, { logger, transport }) => {
    const state = getState();

    const id = getSlugId(state);
    const ampUrl: string = getAmpUrl(state);
    const countryCode: string = getCountryCode(state);
    const graphQlUrl: string = getWebGraphQlUrl(state);
    const locale: string = getLocale(state);

    const force404AndSuggestDestination = () => {
      dispatch(
        setForce404data({
          suggestedTitle: 'Artist Directory',
          suggestedUrl: '/artist/',
        }),
      );
      return { notFound: true, force404: true };
    };

    if (Number.isNaN(parseInt(id, 10))) {
      const errObj = new Error(`invalid id: ${id}`);
      logger.error(
        [CONTEXTS.ROUTER, CONTEXTS.ARTIST],
        errObj.message,
        {},
        errObj,
      );
      return force404AndSuggestDestination();
    }
    try {
      const { data: gqlData } = await transport(
        getArtistData({ articles: 10, baseUrl: graphQlUrl, id, locale }),
      );

      const { data: artistData } = await transport(
        getArtistByArtistId({ ampUrl, artistId: id, countryCode }),
      );

      const articles = (gqlData?.data?.artist?.content ?? []).map(
        mapGraphQlResponse,
      );

      dispatch(artistReceived([{ ...(artistData?.artist ?? {}) }]));
      return dispatch(
        articlesLoaded(articles, 'artist', artistData?.artist?.artistId),
      );
    } catch (error: any) {
      const errObj =
        error instanceof Error ? error : new Error(error.statusText ?? 'error');
      logger.error(
        [CONTEXTS.ROUTER, CONTEXTS.ARTIST, CONTEXTS.NEWS],
        errObj.message,
        {},
        errObj,
      );
      return force404AndSuggestDestination();
    }
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
