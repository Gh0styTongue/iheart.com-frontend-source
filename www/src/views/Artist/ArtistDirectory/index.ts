import loadable from '@loadable/component';
import withAnalytics from 'modules/Analytics/withAnalytics';
import {
  ArtistDirectoryGenre,
  getArtistDirectoryGenres,
  getCurrentArtistDirectoryGenre,
} from 'state/Genres/selectors';
import { connect } from 'react-redux';
import { createStructuredSelector } from 'reselect';
import { flowRight } from 'lodash-es';
import { getAsyncData, pageInfo } from './statics';
import { getCurrentArtistDirectoryRecs } from 'state/Recs/selectors';
import { getCurrentPath } from 'state/Routing/selectors';
import { getFavoriteStations } from 'state/Stations/selectors';
import { MOST_POPULAR_ARTISTS_CATEGORY_ID } from 'state/Recs/constants';
import { navigate } from 'state/Routing/actions';
import { Rec } from 'state/Recs/types';
import { State } from 'state/types';
import { supportsSocialConnect } from 'state/SiteData/selectors';
import { ViewWithStatics } from 'views/ViewWithStatics';

const ArtistDirectory = loadable(
  () => import('./ArtistDirectory'),
) as ViewWithStatics;

ArtistDirectory.getAsyncData = getAsyncData;
ArtistDirectory.pageInfo = pageInfo;

export default flowRight(
  connect(
    createStructuredSelector<
      State,
      {
        currentPath: string;
        favoriteStations: Array<any>;
        genre: ArtistDirectoryGenre;
        genres: Array<ArtistDirectoryGenre>;
        recs: Array<Rec & { name: string; seedId: number; seedType: string }>;
        supportsSocialConnect: boolean;
      }
    >({
      currentPath: getCurrentPath,
      favoriteStations: getFavoriteStations,
      genre: getCurrentArtistDirectoryGenre,
      genres: getArtistDirectoryGenres,
      recs: getCurrentArtistDirectoryRecs,
      supportsSocialConnect,
    }),
    { navigate },
  ),
  withAnalytics(
    ({
      genre: { id, title } = {},
    }: {
      genre: { id?: number; title?: string };
    }) => ({
      filterName: title,
      filterType: id === MOST_POPULAR_ARTISTS_CATEGORY_ID ? undefined : 'Genre',
      pageName: `artist_radio_${
        id === MOST_POPULAR_ARTISTS_CATEGORY_ID ? '' : 'sub_'
      }directory`,
    }),
  ),
)(ArtistDirectory);
