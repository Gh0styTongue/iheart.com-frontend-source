import qs from 'qs';
import { getTranslateFunction } from 'state/i18n/helpers';
import { slugify } from 'utils/string';

export function buildLiveDirectoryUrl(
  marketCountry,
  marketId,
  city,
  stateAbbreviation,
  genreId,
) {
  const queryString = genreId ? `?${qs.stringify({ genreId })}` : '';
  if (!marketId && marketCountry && genreId) {
    return `/live/country/${marketCountry}/${queryString}`;
  }
  if (!marketId && genreId) {
    return `/live/${queryString}`;
  }
  if (marketId && marketCountry) {
    const slug = slugify(`${city} ${stateAbbreviation} ${marketId}`);
    return `/live/country/${marketCountry}/city/${slug}/${queryString}`;
  }
  return '/live/';
}

export function getLiveDirectoryPageInfo(
  state,
  countryCode,
  genreId,
  genre,
  market,
) {
  const translate = getTranslateFunction(state);
  const city = `${market?.city}, ${market?.stateAbbreviation}`;
  const countryAbbreviation =
    !countryCode || countryCode === 'US' ? 'the US' : countryCode;
  const genreName = genre?.name;

  let pageTitle = translate(
    'Listen to the Best Live Radio Stations in {countryAbbreviation}',
    {
      countryAbbreviation,
    },
  );
  if (market?.city && market?.stateAbbreviation && genreName) {
    pageTitle = translate('Listen to {genreName} Radio Stations in {city}', {
      city,
      genreName,
    });
  } else if (market?.city && market?.stateAbbreviation) {
    pageTitle = translate('Listen to Top Radio Stations in {city}, Free', {
      city,
    });
  } else if (genreName) {
    pageTitle = translate(
      'Live {genreName} Radio Stations in {countryAbbreviation}',
      {
        countryAbbreviation,
        genreName,
      },
    );
  }

  return {
    pageTitle,
    pageType: genreId ? 'live:genre' : 'live',
    ...(genreId ? { pageId: genreId } : {}),
  };
}
