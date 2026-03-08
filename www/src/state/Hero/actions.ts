/* eslint-disable camelcase */
import analytics, { Events } from 'modules/Analytics';
import paths from 'router/Routes/paths';
import PlayerState from 'web-player/PlayerState';
import transport from 'api/transport';
import { CONTEXTS } from 'modules/Logger';
import { getCountryCode, getWebGraphQlUrl } from 'state/Config/selectors';
import { getCredentials } from 'state/Session/selectors';
import { getLeadsData } from 'state/Config/services';
import { mapStationToAnalyticsData } from 'modules/Analytics/helpers/stationMappers';
import { matchPath } from 'react-router';
import { parse } from 'url';
import {
  RESET,
  SET_BACKGROUND,
  SET_HAS_HERO,
  SET_HIDE_HERO,
  SET_HOME_HERO,
  SET_PREMIUM_BACKGROUND,
  SET_TITLE,
} from 'state/Hero/constants';
import { Thunk } from 'state/types';

export type SetHomeHeroPayload = {
  name: string;
  btnTitle: string;
  url: string;
  assetUrl: string;
  target: string;
};

export function setHomeHero(
  name: string,
  btnTitle: string,
  url: string,
  assetUrl: string,
  target: string,
): { payload: SetHomeHeroPayload; type: string } {
  return {
    payload: {
      assetUrl,
      btnTitle,
      name,
      target,
      url,
    },
    type: SET_HOME_HERO,
  };
}

export function setHeroPremiumBackground(
  primaryBackgroundSrc: string,
  backgroundColor: string,
  noLogo?: boolean,
) {
  return {
    payload: {
      backgroundColor,
      noLogo,
      primaryBackgroundSrc,
    },
    type: SET_PREMIUM_BACKGROUND,
  };
}

export function setHeroBackground(
  primaryBackgroundSrc: string,
  imgUrl: string,
  noLogo: boolean,
  noMask: boolean,
) {
  return {
    payload: {
      imgUrl,
      noLogo,
      noMask,
      primaryBackgroundSrc,
    },
    type: SET_BACKGROUND,
  };
}

export function setHasHero(hasHero: boolean | null | undefined) {
  return {
    payload: { hasHero },
    type: SET_HAS_HERO,
  };
}

export function setHideHero(hideHero: boolean) {
  return {
    payload: { hideHero },
    type: SET_HIDE_HERO,
  };
}

export function resetHero() {
  return { type: RESET };
}

export function setTitle(name: string) {
  return {
    payload: { name },
    type: SET_TITLE,
  };
}

export type Card = {
  background_color: string;
  catalog: null;
  exclusion: [{ tags: Array<never> }];
  id: string;
  img_meta: { base_id: string; bucket: string; ops: Array<never> };
  img_uri: string;
  important: boolean;
  link: {
    description: string;
    name: string;
    target: string;
    urls: { device: string; web: string };
  };
  position: number;
  priority: number;
  publish_facets: Array<never>;
  range: { begin: number; end: number };
  subtitle: string;
  targets: [{ tags: Array<string> }];
  title: string;
  url: string;
  use_catalog_image: boolean;
};

export function getHero(): Thunk<Promise<void>> {
  return async function thunk(dispatch, getState, { logger }) {
    const state = getState();
    const webGraphQlUrl = getWebGraphQlUrl(state);
    const countryCode = getCountryCode(state);
    try {
      const { data } = await transport(
        getLeadsData({
          baseUrl: webGraphQlUrl,
          countryCode,
          locale: 'en-US',
        }),
      );
      const [mainCard, secondaryCard] = data?.data?.ForYouHero ?? [];

      if (mainCard) {
        const {
          background_color: backgroundColor,
          img_uri: imgUri,
          link,
          title,
        } = mainCard;
        const { name, urls, target } = link;
        const { web: webUrl } = urls;
        const secondaryImgUri = secondaryCard && secondaryCard.img_uri;
        await dispatch(resetHero());
        await dispatch(
          setHeroPremiumBackground(
            imgUri,
            backgroundColor,
            !!imgUri && !secondaryCard,
          ),
        );
        await dispatch(
          setHomeHero(title, name, webUrl, secondaryImgUri, target),
        );
      }
    } catch (e: any) {
      const errObj = e instanceof Error ? e : new Error(e);
      logger.error([CONTEXTS.ROUTER, CONTEXTS.REDUX], e, {}, errObj);
    }
  };
}

const analyticsPaths = {
  album_profile: [paths.artist.album],
  article: [paths.news.contentArticle, paths.news.legacy],
  artist_directory: [paths.artist.directory],
  artist_news: [paths.artist.news],
  artist_profile: [
    paths.artist.profile,
    paths.artist.song,
    paths.artist.songs,
    paths.artist.albums,
    paths.artist.similar,
  ],
  for_you: [paths.misc.forYou],
  genre_directory: [paths.genre.directory],
  genre_game: [paths.genre.game],
  genre_profile: [paths.genre.profile],
  live_directory: [paths.live.directory, paths.live.country, paths.live.city],
  live_profile: [paths.live.profile],
  microsite_home: paths.misc.refresh,
  new_for_you_radio_profile: [
    '/playlist/your-weekly-mixtape-:profileId-new4u/',
  ],
  news_directory: [paths.news.directory, paths.news.topicDirectory],
  playlist_radio_directory: [
    paths.playlist.directory,
    paths.playlist.subDirectory,
  ],
  playlist_radio_profile: [paths.playlist.profile],
  podcast_directory: [
    paths.podcast.directory,
    paths.podcast.category,
    paths.podcast.networks,
  ],
  podcast_profile: [
    paths.podcast.profile,
    paths.podcast.episode,
    paths.podcast.show,
    paths.podcast.news,
  ],
  upsell: [paths.recurly.upgrade],
} as const;

const getPageName = (url: string) => {
  const parsed = parse(url);
  if (
    parsed.host &&
    parsed.host !== 'null' &&
    !parsed.host.endsWith('iheart.com')
  ) {
    return '3rd-party';
  }
  const pageName = Object.keys(analyticsPaths).find(
    key =>
      !!analyticsPaths[key as keyof typeof analyticsPaths].find(
        (path: string) => !!matchPath(parsed.pathname!, { exact: true, path }),
      ),
  );
  return pageName || 'unknown';
};

export function trackItemSelected(
  origin: 'for_you' | 'home',
  url: string,
): Thunk {
  return (dispatch, getState) => {
    const pageName = getPageName(url);
    const location = `${origin}|hero|${pageName}`;
    const playerState = PlayerState.getInstance();
    const station = playerState.getStation();
    const track = playerState.getTrack();
    const { profileId } = getCredentials(getState());
    const stationData =
      track && station ?
        mapStationToAnalyticsData({
          currentTrack: track,
          profileId: profileId!,
          station,
        })
      : {};
    analytics.track(Events.ItemSelected, {
      ...stationData,
      event: { location },
    });
  };
}
