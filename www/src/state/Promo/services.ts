import composeRequest, { method, query, urlTagged } from 'api/helpers';

export function getPromos({
  base,
  country,
}: {
  base: string;
  country: string;
}) {
  return composeRequest(
    method('get'),
    urlTagged`${{ leadsUrl: base }}/api/cards`,
    query({
      collection: 'collections/subscription-promos',
      country,
      facets: 'devices/web',
    }),
  )();
}
