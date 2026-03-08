import composeRequest, { method, query, urlTagged } from 'api/helpers';

export function getMarketByLocationQuery(
  { ampUrl },
  {
    latitude = undefined,
    longitude = undefined,
    zip = undefined,
    country = undefined,
    useIP = false,
    bustCache = false,
    limit = 1,
  },
) {
  return composeRequest(
    method('get'),
    urlTagged`${{ ampUrl }}/api/v2/content/markets`,
    query({
      ...(latitude && longitude ? { lat: latitude, lng: longitude } : {}),
      ...(zip ? { zipCode: zip } : {}),
      countryCode: country,
      limit,
      ...(!bustCache ? { cache: !bustCache } : {}),
      ...(useIP ? { useIP } : {}),
    }),
  )();
}

export function getMarketByIdQuery({ ampUrl, id }) {
  return composeRequest(
    method('get'),
    urlTagged`${{ ampUrl }}/api/v2/content/markets/${{ id }}`,
  )();
}

export function getCountryOptions(ampUrl) {
  return composeRequest(
    method('get'),
    urlTagged`${{ ampUrl }}/api/v2/content/countries`,
  )();
}
