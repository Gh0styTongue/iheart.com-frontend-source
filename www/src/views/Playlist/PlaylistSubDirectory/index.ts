import loadable from '@loadable/component';
import withAnalytics from 'modules/Analytics/withAnalytics';
import { connect } from 'react-redux';
import { createStructuredSelector, Selector } from 'reselect';
import { flowRight } from 'lodash-es';
import { getAsyncData, pageInfo } from './statics';
import {
  getCategoryProp,
  getCategoryTitle,
} from 'state/PlaylistDirectory/selectors';
import { getParams } from 'state/Routing/selectors';
import { Props } from './PlaylistSubDirectory';
import { State } from 'state/types';
import { ViewWithStatics } from 'views/ViewWithStatics';

const PlaylistSubDirectory = loadable(
  () => import('./PlaylistSubDirectory'),
) as ViewWithStatics;

PlaylistSubDirectory.getAsyncData = getAsyncData;
PlaylistSubDirectory.pageInfo = pageInfo;

export default flowRight(
  connect(
    createStructuredSelector<
      State,
      Pick<Props, 'categoryProp' | 'categoryTitle' | 'params'>
    >({
      categoryProp: getCategoryProp,
      categoryTitle: getCategoryTitle,
      params: getParams as any as Selector<
        State,
        {
          category: string;
          collection: 'decades' | 'genre-playlists' | 'perfect-for';
          subcategory: string;
        }
      >,
    }),
  ),
  withAnalytics(({ categoryTitle, params }: Props) => ({
    filterName: categoryTitle,
    filterType: params.collection,
    pageName: 'playlist_sub_directory',
  })),
)(PlaylistSubDirectory);
