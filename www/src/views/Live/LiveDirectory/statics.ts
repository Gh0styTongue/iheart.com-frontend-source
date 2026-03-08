import qs from 'qs';
import safeStringify from 'utils/safeStringify';
import { CONTEXTS } from 'modules/Logger';
import { getAmpUrl } from 'state/Config/selectors';
import {
  getCountryFilter,
  getGenreFilter,
  getGenreId,
  getMarketFilter,
} from 'state/Live/selectors';
import {
  getCountryOptions,
  getMarketByLocationQuery,
} from 'state/Location/services';
import { getGenres } from 'state/Genres/services';
import { getLiveDirectoryPageInfo } from 'views/Live/LiveDirectory/LiveDirectoryHead/helpers';
import {
  getLocation,
  getSectionId,
  getUrlCountry,
} from 'state/Routing/selectors';
import { liveStations } from 'state/Live/services';
import { mapGenre } from 'state/Genres/shims';
import { mapStations } from 'state/Live/shims';
import {
  receiveStations,
  setCountry,
  setCountryOptions,
  setGenre,
  setMarket,
  setMarketAndGenreOptions,
} from 'state/Live/actions';
import { setHasHero } from 'state/Hero/actions';
import type { AxiosInstance } from 'axios';
import type { Country, LiveStation } from 'state/Live/types';
import type { Genre } from 'state/Genres/types';
import type { GetAsyncData, State } from 'state/types';
import type { Market } from 'state/Location/types';
import type { PageInfo } from 'ads/types';

type BaseParams = {
  ampUrl: string;
  transport: AxiosInstance;
};

export const fetchCountries = async ({
  ampUrl,
  transport,
  countryCode,
}: BaseParams & { countryCode: string }): Promise<Array<Country>> => {
  const { data } = await transport(getCountryOptions(ampUrl));
  const hits: Array<Country> = data?.hits ?? [];

  if (
    hits.some(({ abbreviation }) => abbreviation === countryCode.toUpperCase())
  ) {
    return hits;
  } else {
    throw new Error(
      `country filter "${countryCode}" not supported in current app country: ${ampUrl}`,
    );
  }
};

export const fetchAndMapGenres = async ({ ampUrl, transport }: BaseParams) => {
  const { data } = await transport(
    getGenres({
      ampUrl,
      genreType: 'liveStation',
    }),
  );

  const genres: Array<Genre> = (data?.genres ?? []).map(mapGenre);

  return genres.sort((g1, g2) => (g1.name >= g2.name ? 1 : -1));
};

export const fetchAndSortMarkets = async ({
  ampUrl,
  transport,
  countryCode,
}: BaseParams & { countryCode: string }) => {
  const { data } = await transport(
    getMarketByLocationQuery(
      { ampUrl },
      // @ts-ignore
      { country: countryCode, limit: 10000 },
    ),
  );

  return ((data?.hits ?? []) as Array<Market>).sort((m1, m2) =>
    m1.name >= m2.name ? 1 : -1,
  );
};

export const fetchAndMapLiveStations = async ({
  ampUrl,
  genreId,
  marketId,
  transport,
  countryCode,
}: BaseParams & {
  genreId?: number;
  marketId: number | null;
  countryCode: string;
}) => {
  const { data } = await transport(
    liveStations({
      ampUrl,
      filters: {
        countryCode,
        limit: 1000,
        ...(marketId ? { marketId } : {}),
        ...(genreId ? { genreId } : {}),
      },
    }),
  );

  return mapStations(data?.hits ?? []) as Array<LiveStation>;
};

export const getAsyncData: GetAsyncData =
  () =>
  async (dispatch, getState, { transport, logger }) => {
    const state = getState();
    const { pathname, search } = getLocation(state);

    const countryCode = getUrlCountry(state);
    const urlCountryCaps = countryCode.toUpperCase();

    // Redirect to proper url
    if (countryCode && urlCountryCaps !== countryCode) {
      return {
        redirectUrl: (pathname as string).replace(
          /\/country\/[^/]*\//,
          `/country/${urlCountryCaps}/`,
        ), // replaces contiguous sequence of non-slash characters after /country/
        routeStatus: 301,
      };
    }

    const marketId = getSectionId(state);

    const genreId =
      parseInt(
        qs.parse(search ?? '', { ignoreQueryPrefix: true })?.genreId,
        10,
      ) ?? null;

    // url doesn't have enough info and we're on the server then defer redirect to client.
    // clientside handles this in componentDidMount
    if (!countryCode && !marketId && !genreId) {
      return undefined;
    }

    const ampUrl = getAmpUrl(state);

    try {
      const countries = await fetchCountries({
        ampUrl,
        transport,
        countryCode,
      });
      const genres = await fetchAndMapGenres({ ampUrl, transport });
      const markets = await fetchAndSortMarkets({
        ampUrl,
        transport,
        countryCode,
      });
      const stations = await fetchAndMapLiveStations({
        ampUrl,
        transport,
        genreId,
        marketId,
        countryCode,
      });

      const [country] = countries.filter(c => c.abbreviation === countryCode);
      const [genre = {} as Genre] = genres.filter(g => g.id === genreId);
      const [market = {} as Market] = markets.filter(
        m => m.marketId === marketId,
      );

      if (genreId && !genre) {
        // 404 if we can't find the genre w/ such ID
        throw new Error(
          `Genre ${genreId} is not in the list of genres for filters: ${safeStringify(
            genres,
          )}`,
        );
      } else if (marketId && !market) {
        // 404 if we can't find the market w/ such ID
        throw new Error(
          `Market ${marketId} is not in the list of markets for filters: ${safeStringify(
            markets,
          )}`,
        );
      }

      dispatch(setCountryOptions(countries));
      dispatch(setCountry(country));
      dispatch(setMarketAndGenreOptions(country.abbreviation, markets, genres));
      dispatch(setMarket(market));
      dispatch(setGenre(genre));
      dispatch(
        receiveStations(stations, { country, market, genre: genre as any }),
      );
      dispatch(setHasHero(false));

      return undefined;
    } catch (error: any) {
      const errObj =
        error instanceof Error ? error : (
          new Error(error.statusText ?? 'error loading props')
        );
      logger.error(
        [CONTEXTS.ROUTER, CONTEXTS.LIVE],
        errObj.message,
        {},
        errObj,
      );

      return {
        notFound: true,
      };
    }
  };

export function pageInfo(state: State): Partial<PageInfo> {
  const abbreviation = getCountryFilter(state)?.abbreviation;
  const genreId = getGenreId(state);
  const genre = getGenreFilter(state);
  const market = getMarketFilter(state);

  return {
    ...getLiveDirectoryPageInfo(state, abbreviation, genreId, genre, market),
    targeting: {
      name: 'directory:live',
      modelId: 'directory:live:home',
    },
  };
}
