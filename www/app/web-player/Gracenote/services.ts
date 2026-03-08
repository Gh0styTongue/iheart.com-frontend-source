import composeRequest, { method, urlTagged } from 'api/helpers';
import { AxiosRequestConfig } from 'axios';

export function getCurrentTrackMeta({
  ampUrl,
  id,
}: {
  ampUrl: string;
  id: number | string;
}): AxiosRequestConfig {
  return composeRequest(
    method('get'),
    urlTagged`${{ ampUrl }}/api/v3/live-meta/stream/${{
      trackId: String(id),
    }}/currentTrackMeta`,
  )();
}
