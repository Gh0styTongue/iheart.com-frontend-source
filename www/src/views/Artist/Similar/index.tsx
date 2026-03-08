import loadable from '@loadable/component';
import withAnalytics from 'modules/Analytics/withAnalytics';
import { connect } from 'react-redux';
import { createStructuredSelector, Selector } from 'reselect';
import { flowRight } from 'lodash-es';
import {
  getArtistPath,
  getCurrentArtistId,
  getCurrentArtistName,
  getSimilarArtistsPath,
} from 'state/Artists/selectors';
import { getAsyncData, pageInfo } from './statics';
import { Props } from './Similar';
import { showAlbumHeaderSelector } from 'state/Entitlements/selectors';
import { State } from 'state/types';
import { ViewWithStatics } from 'views/ViewWithStatics';

const Similar = loadable(() => import('./Similar')) as ViewWithStatics;

Similar.getAsyncData = getAsyncData;
Similar.pageInfo = pageInfo;

const getAnalyticsData = ({ artistId, artistName: name }: Props) => ({
  id: `artist|${artistId}`,
  name,
  pageName: 'artist_similar_artists',
});

const mapStateToProps = createStructuredSelector<
  State,
  {
    artistId: number;
    artistName: string;
    artistUrl: string;
    pagePath: string;
    showAlbumHeader: boolean;
  }
>({
  artistId: getCurrentArtistId as any as Selector<State, number>,
  artistName: getCurrentArtistName as any as Selector<State, string>,
  artistUrl: getArtistPath as any as Selector<State, string>,
  pagePath: getSimilarArtistsPath as any as Selector<State, string>,
  showAlbumHeader: showAlbumHeaderSelector,
});

export default flowRight(
  connect(mapStateToProps),
  withAnalytics(getAnalyticsData),
)(Similar);
