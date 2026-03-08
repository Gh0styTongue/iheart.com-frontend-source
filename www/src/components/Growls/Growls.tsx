import GrowlsWrapper from './primitives/GrowlsWrapper';
import loadable from '@loadable/component';
import { getGrowls } from 'state/UI/selectors';
import { GrowlVariants } from './constants';
import { useSelector } from 'react-redux';
import type { FunctionComponent } from 'react';
import type { GrowlVariant } from './types';

const growlMap = {
  [GrowlVariants.FavoriteChanged]: loadable(
    () => import('./variants/FavoriteChangedGrowl'),
  ),
  [GrowlVariants.FollowedChanged]: loadable(
    () => import('./variants/FollowedChangedGrowl'),
  ),
  [GrowlVariants.Notify]: loadable(() => import('./variants/NotifyGrowl')),
  [GrowlVariants.OutOfSkips]: loadable(
    () => import('./variants/OutOfSkipsGrowl'),
  ),
  [GrowlVariants.PlayerError]: loadable(
    () => import('./variants/PlayerErrorGrowl'),
  ),
  [GrowlVariants.PlaylistFollowed]: loadable(
    () => import('./variants/PlaylistFollowedGrowl'),
  ),
  [GrowlVariants.SocialNetworkError]: loadable(
    () => import('./variants/SocialNetworkErrorGrowl'),
  ),
  [GrowlVariants.ThumbsUpdated]: loadable(
    () => import('./variants/ThumbsUpdatedGrowl'),
  ),
} as const;

const Growls: FunctionComponent = () => {
  const growls = useSelector(getGrowls);

  return (
    <GrowlsWrapper data-test="growls" noGrowl={!growls.length}>
      {growls.map(({ data, id, type }) => {
        const Growl = type && (growlMap[type] as GrowlVariant<typeof type>);

        if (!Growl) {
          throw new Error(`${type} is not a valid growl type`);
        }

        return <Growl data={data} id={id} key={`${id}-${type}-${data}`} />;
      })}
    </GrowlsWrapper>
  );
};

export default Growls;
