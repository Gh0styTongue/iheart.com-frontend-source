import { getPodcastById } from 'state/Podcast/selectors';
import { Podcast } from 'state/Podcast/types';
import { requestPodcast } from 'state/Podcast/actions';
import { Store } from 'state/types';

export function podcastResolver({
  stationId: podcastId,
  store,
}: {
  stationId: number | string;
  store: Store;
}): Promise<Podcast> {
  const podcast = getPodcastById(store.getState(), { podcastId });

  if (!podcast || !Object.keys(podcast).length) {
    return store
      .dispatch(requestPodcast(Number(podcastId)))
      .then(() => getPodcastById(store.getState(), { podcastId }));
  }

  return Promise.resolve(podcast);
}
