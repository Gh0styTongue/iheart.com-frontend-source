import composeRequest, { method, urlTagged } from 'api/helpers';

export function makeRecurlySkuRequest({ ampUrl }: { ampUrl: string }) {
  return composeRequest(
    urlTagged`${{ ampUrl }}/api/v3/subscription/external/recurly/plans`,
    method('get'),
  )();
}
