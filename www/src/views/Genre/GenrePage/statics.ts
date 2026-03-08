import { articlesLoaded } from 'state/News/actions';
import { CONTEXTS } from 'modules/Logger';
import { genreMapper } from './helpers';
import { genresReceived } from 'state/Genres/actions';
import {
  getAmpUrl,
  getCountryCode,
  getWebGraphQlUrl,
} from 'state/Config/selectors';
import { getGenreData, getGenres } from 'state/Genres/services';
import { getLiveStationById } from 'state/Live/services';
import { getLocale } from 'state/i18n/selectors';
import { getResourceId, getSlugId } from 'state/Routing/selectors';
import { mapGraphQlResponse } from 'state/News/helpers';
import { PAGE_TYPE } from 'constants/pageType';
import { receiveStations } from 'state/Live/actions';
import { setForce404data } from 'state/Routing/actions';
import { setHeroPremiumBackground } from 'state/Hero/actions';
import type { AxiosResponse } from 'axios';
import type { GetAsyncData } from 'state/types';
import type { State } from 'state/buildInitialState';

export const getAsyncData: GetAsyncData =
  () =>
  async (dispatch, getState, { transport, logger }) => {
    const state = getState();
    const ampUrl = getAmpUrl(state);
    const countryCode = getCountryCode(state);
    const graphQlUrl: string = getWebGraphQlUrl(state);
    const id = getSlugId(state);

    const force404AndSuggestDestination = () => {
      dispatch(
        setForce404data({
          suggestedTitle: 'Genre Directory',
          suggestedUrl: '/genre/',
        }),
      );
      return { notFound: true, force404: true };
    };

    const { data: genresResponse } = await transport(
      getGenres({ ampUrl, countryCode, genreType: 'liveStation' }),
    );
    const { currentId, genres } = genreMapper(id, genresResponse);

    if (Number.isNaN(parseInt(id, 10))) {
      const errObj = new Error(`invalid id: ${id}`);
      logger.error(
        [CONTEXTS.ROUTER, CONTEXTS.GENRE],
        errObj.message,
        {},
        errObj,
      );
      return force404AndSuggestDestination();
    }

    let gqlData;
    try {
      gqlData = await transport(
        getGenreData({
          articles: 10,
          baseUrl: graphQlUrl,
          id,
          locale: getLocale(state),
        }),
      );
    } catch (e: any) {
      logger.error([CONTEXTS.ROUTER, CONTEXTS.GENRE], e.message, {}, e);
      gqlData = {};
    }

    // new fields coming from gql
    const data = (gqlData as AxiosResponse<any>)?.data?.data?.genre?.genre;
    // not a genre, time to 404
    if (!data) {
      return force404AndSuggestDestination();
    }
    const siteConfig = data?.site?.config?.config;
    const streamId = siteConfig?.partners?.ihr_stream?.id;
    const heroImage = siteConfig?.design?.ihr_hero_image;
    const heroColor = siteConfig?.design?.ihr_hero_color;

    let liveStation;
    try {
      const res = await transport(
        getLiveStationById({ ampUrl, countryCode, id: streamId }),
      );
      liveStation = res.data;
    } catch (e: any) {
      logger.error([CONTEXTS.ROUTER, CONTEXTS.GENRE], e.message, {}, e);
      liveStation = { hits: [] };
    }

    const mappedGenres = genres.map(genre => {
      if (genre.id === currentId) return { ...genre, sparkStreamId: streamId };

      return genre;
    });
    const articles = (data?.site?.timeline ?? []).map(mapGraphQlResponse);

    dispatch(genresReceived(mappedGenres));
    dispatch(setHeroPremiumBackground(heroImage, heroColor));
    dispatch(receiveStations(liveStation.hits));
    dispatch(articlesLoaded(articles, 'genre', currentId));
    return undefined;
  };

export function pageInfo(state: State) {
  const pageId = getResourceId(state) as string | null;
  return {
    pageId,
    pageType: PAGE_TYPE.GENRE,
    targeting: {
      name: 'directory:genre',
      modelId: pageId ? `gd${pageId}` : 'directory:genre:home',
    },
  };
}
