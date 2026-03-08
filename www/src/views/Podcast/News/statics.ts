import { getPodcastNews, requestPodcast } from 'state/Podcast/actions';
import { getSeedId } from 'state/Podcast/selectors';
import { getSlugId } from 'state/Routing/selectors';
import { PAGE_TYPE } from 'constants/pageType';
import { setForce404data } from 'state/Routing/actions';
import { setHasHero } from 'state/Hero/actions';
import { STATION_TYPE } from 'constants/stationTypes';
import type { GetAsyncData, State } from 'state/types';

export const getAsyncData: GetAsyncData = () => async (dispatch, getState) => {
  const state = getState();
  const id = getSlugId(state);

  const force404AndSuggestDestination = () => {
    dispatch(
      setForce404data({
        suggestedTitle: 'Podcast Directory',
        suggestedUrl: '/podcast/',
      }),
    );
    return { notFound: true, force404: true };
  };

  // We want to make sure the podcast has been fetched before we get the associated news.
  try {
    const podcast = await dispatch(requestPodcast(id));

    // If there's no podcast, there's no news. 404.
    if (!podcast) {
      return force404AndSuggestDestination();
    }

    await Promise.all([
      dispatch(getPodcastNews(id)),
      dispatch(setHasHero(false)),
    ]);

    return undefined;
  } catch (error) {
    // whoops, something's not right. 404.
    return force404AndSuggestDestination();
  }
};

export function pageInfo(state: State) {
  const pageId = getSeedId(state);

  return {
    pageId,
    pageType: PAGE_TYPE.SHOW,
    stationType: STATION_TYPE.PODCAST,
    targeting: {
      name: pageId ? 'talkshow' : 'directory:show',
      modelId: pageId ? `s${pageId}` : 'directory:show:home',
    },
  };
}
