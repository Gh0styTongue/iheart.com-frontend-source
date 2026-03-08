import composeRequest, { body, method, urlTagged } from 'api/helpers';

export function postEvent(iglooUrl: string, event: Record<string, any>) {
  return composeRequest(
    body(event),
    method('post'),
    urlTagged`${{ iglooUrl }}/events`,
  )();
}
