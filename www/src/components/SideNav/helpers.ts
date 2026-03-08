import url from 'url';
import type { IGetTranslateFunctionResponse } from 'redux-i18n';

function isActive(path: string, exactMatch = false) {
  return (match: boolean, location: { pathname: string }): boolean => {
    const { pathname = '' } = location;
    const matchesLocation =
      exactMatch ? pathname === path : pathname.match(path);
    return (match || matchesLocation) as boolean;
  };
}

export type NavLinks = {
  contest: string;
  custom: string;
  events: string;
  features: string;
  forYou: string;
  genre: string;
  home: string;
  live: string;
  myMusic: string;
  myStations: string;
  news: string;
  photo: string;
  playlist: string;
  podcast: string;
  yourLibrary: string;
};

export function getNavList({
  customRadioEnabled,
  internationalPlaylistRadioEnabled,
  navLinks,
  pageNamePrefix,
  showPlaylists,
  translate,
}: {
  customRadioEnabled: boolean;
  internationalPlaylistRadioEnabled: boolean;
  navLinks: NavLinks;
  pageNamePrefix: string;
  showPlaylists: boolean;
  translate: IGetTranslateFunctionResponse;
}) {
  const {
    forYou,
    live,
    podcast,
    news,
    features,
    events,
    contest,
    photo,
    custom,
    playlist,
    yourLibrary,
  } = navLinks;
  return [
    {
      dataTest: 'for-you-menu',
      exact: true,
      isActive: isActive('/for-you'),
      pageName: `${pageNamePrefix}:forYou`,
      text: translate('For You'),
      title: 'iHeart',
      to: forYou,
    },
    {
      dataTest: 'your-library-menu',
      isActive: isActive('/your-library'),
      pageName: `${pageNamePrefix}:yourLibrary`,
      text: translate('Your Library'),
      to: yourLibrary,
    },
    {
      dataTest: 'live-radio-menu',
      isActive: isActive('/^live'),
      pageName: `${pageNamePrefix}:liveradio`,
      text: translate('Live Radio'),
      to: live,
    },
    {
      dataTest: 'podcasts-menu',
      isActive: isActive('/podcast', true),
      pageName: `${pageNamePrefix}:podcast`,
      text: translate('Podcasts'),
      to: podcast,
    },
    {
      dataTest: 'artist-radio-menu',
      isActive: isActive('/artists', true),
      pageName: `${pageNamePrefix}:artistradio`,
      text: translate('Artist Radio'),
      to: customRadioEnabled ? custom : null,
    },
    {
      dataTest: 'playlists-menu',
      isActive: isActive('/playlist', true),
      pageName: `${pageNamePrefix}:playlist`,
      text: translate('Playlists'),
      to: showPlaylists || internationalPlaylistRadioEnabled ? playlist : null,
    },
    {
      dataTest: 'news-menu',
      pageName: `${pageNamePrefix}:news`,
      target: '_blank',
      text: translate('News'),
      to: news,
    },
    {
      dataTest: 'features-menu',
      pageName: `${pageNamePrefix}:features`,
      target: '_blank',
      text: translate('Features'),
      to: features,
    },
    {
      dataTest: 'events-menu',
      pageName: `${pageNamePrefix}:events`,
      target: '_blank',
      text: translate('Events'),
      to: events,
    },
    {
      dataTest: 'contests-menu',
      pageName: `${pageNamePrefix}:contests`,
      target: url.parse(contest || '').host ? '_blank' : '',
      text: translate('Contests'),
      to: contest,
    },
    {
      dataTest: 'photos-menu',
      pageName: `${pageNamePrefix}:photos`,
      target: '_blank',
      text: translate('Photos'),
      to: photo,
    },
  ].filter(({ to }) => !!to);
}
