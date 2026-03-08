import * as React from 'react';
import loadable from '@loadable/component';
import withAnalytics from 'modules/Analytics/withAnalytics';
import { compose } from 'redux';
import { connect } from 'react-redux';
import { createStructuredSelector } from 'reselect';
import { getAsyncData, pageInfo } from './statics';
import { getContentLink } from 'state/Links/selectors';
import {
  getCountryCode,
  getMediaServerUrl,
  getSiteUrl,
} from 'state/Config/selectors';
import {
  getCurrentGenreArticles,
  getCurrentGenreId,
  getCurrentGenreLogo,
  getCurrentGenreName,
  getCurrentGenreSparkStreamId,
  getGenres,
} from 'state/Genres/selectors';
import { getStationLoaded } from 'state/Player/selectors';
import { localize } from 'redux-i18n';
import type { Props } from './GenrePage';
import type { State } from 'state/types';
import type { ViewWithStatics } from 'views/ViewWithStatics';

const GenrePage = loadable(() => import('./GenrePage')) as ViewWithStatics;

GenrePage.getAsyncData = getAsyncData;
GenrePage.pageInfo = pageInfo;

type ConnectedProps = Omit<Props, 'translate'>;

export default compose(
  localize('translate'),
  connect(
    createStructuredSelector<State, ConnectedProps>({
      articles: getCurrentGenreArticles,
      contentLink: getContentLink,
      countryCode: getCountryCode,
      genreId: getCurrentGenreId,
      genreName: getCurrentGenreName,
      genres: getGenres,
      logo: getCurrentGenreLogo,
      mediaServerUrl: getMediaServerUrl,
      seedId: getCurrentGenreSparkStreamId,
      siteUrl: getSiteUrl,
      stationLoaded: getStationLoaded,
    }),
  ),
  withAnalytics<Props>(({ genreName: filterName }: { genreName: string }) => ({
    filterName,
    filterType: filterName ? 'Genre' : undefined,
    pageName: 'genre_sub_directory',
  })),
)(GenrePage) as React.ComponentType<Props>;
