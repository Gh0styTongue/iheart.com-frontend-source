import loadable from '@loadable/component';
import withAnalytics from 'modules/Analytics/withAnalytics';
import { pageInfo } from './statics';
import type { ViewWithStatics } from 'views/ViewWithStatics';

const Favorites = loadable(() => import('./Favorites')) as ViewWithStatics;

Favorites.pageInfo = pageInfo;

type AnalyticsProps = {
  name: string;
  profileId: number;
  seedId: string;
};

export default withAnalytics<AnalyticsProps>(
  ({ name, profileId, seedId }: AnalyticsProps) => {
    const isSameUser = Number(seedId) === Number(profileId);
    const prefix = `${isSameUser ? 'my' : 'shared'}_favorites_radio`;
    const pageName = `${prefix}_profile`;
    const id = `${prefix}|${seedId}`;
    return { id, name, pageName };
  },
  {
    trackOnDidUpdate: (prevProps, nextProps) =>
      nextProps.seedId && nextProps.name ?
        prevProps.name !== nextProps.name &&
        prevProps.seedId !== nextProps.seedId
      : false,
  },
)(Favorites);
