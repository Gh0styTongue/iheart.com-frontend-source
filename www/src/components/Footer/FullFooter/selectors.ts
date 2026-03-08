import { createStructuredSelector } from 'reselect';
import {
  getAboutLink,
  getAdvertiseLink,
  getAppsAutoLink,
  getAppsHomeLink,
  getAppsMobileLink,
  getAppsWearLink,
  getBlogLink,
  getBrandLink,
  getContestRulesLink,
  getContestsLink,
  getCustomRadioLink,
  getEventsLink,
  getFeaturesLink,
  getGenresLink,
  getHelpLink,
  getHomeLink,
  getJobsLink,
  getLiveRadioLink,
  getNewsLink,
  getPhotosLink,
  getPlaylistsLink,
  getPodcastsLink,
  getSubscriptionOptionsLink,
} from 'state/Links/selectors';
import {
  getFacebookName,
  getInstagramName,
  getTwitterName,
  getYoutubeName,
} from 'state/Social/selectors';
import type { State } from 'state/buildInitialState';

export const getSocialLinks = createStructuredSelector<
  State,
  {
    facebook: string | undefined;
    instagram: string | undefined;
    twitter: string | undefined;
    youtube: string | undefined;
  }
>({
  facebook: getFacebookName,
  instagram: getInstagramName,
  twitter: getTwitterName,
  youtube: getYoutubeName,
});

export const getNavLinks = createStructuredSelector<
  State,
  {
    contest: string;
    custom: string;
    events: string;
    feature: string;
    forYou: string;
    genre: string;
    live: string;
    news: string;
    photo: string;
    playlist: string;
    podcast: string;
  }
>({
  contest: getContestsLink,
  custom: getCustomRadioLink,
  events: getEventsLink,
  feature: getFeaturesLink,
  forYou: getHomeLink,
  genre: getGenresLink,
  live: getLiveRadioLink,
  news: getNewsLink,
  photo: getPhotosLink,
  playlist: getPlaylistsLink,
  podcast: getPodcastsLink,
});

export const getInfoLinks = createStructuredSelector<
  State,
  {
    about: string;
    advertise: string;
    blog: string;
    brand: string;
    help: string;
    jobs: string;
    rules: string;
    subscription: string;
  }
>({
  about: getAboutLink,
  advertise: getAdvertiseLink,
  blog: getBlogLink,
  brand: getBrandLink,
  help: getHelpLink,
  jobs: getJobsLink,
  rules: getContestRulesLink,
  subscription: getSubscriptionOptionsLink,
});

export const getAppLinks = createStructuredSelector<
  State,
  {
    auto: string;
    home: string;
    mobile: string;
    wear: string;
  }
>({
  auto: getAppsAutoLink,
  home: getAppsHomeLink,
  mobile: getAppsMobileLink,
  wear: getAppsWearLink,
});
