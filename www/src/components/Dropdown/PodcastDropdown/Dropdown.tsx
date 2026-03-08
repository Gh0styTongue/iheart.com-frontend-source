import NavLink from 'components/NavLink';
import ShouldShow from 'components/ShouldShow';
import TileDropdown from 'components/Tile/primitives/TileDropdown';
import useTrackers from 'contexts/Trackers/hooks/useTrackers';
import useTranslate from 'contexts/TranslateContext/useTranslate';
import { Events } from 'modules/Analytics';
import { getIsLoggedOut } from 'state/Session/selectors';
import { GrowlIcons } from 'components/Growls/constants';
import { Menu } from 'components/Tooltip';
import { openSignupModal, showNotifyGrowl } from 'state/UI/actions';
import { STATION_TYPE } from 'constants/stationTypes';
import { updateFollowed } from 'state/Podcast/actions';
import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';

type Props = {
  deleteFromListenHistory: ({
    seedId,
    stationType,
  }: {
    seedId: number;
    stationType: string;
  }) => void;
  followed: boolean;
  recentlyPlayed: boolean;
  seedId: number;
  title: string;
  toggleStationSaved: (type: string, id: number, recentOnly?: boolean) => void;
};

function Dropdown({
  deleteFromListenHistory,
  followed,
  recentlyPlayed,
  seedId,
  title,
  toggleStationSaved,
}: Props) {
  const dispatch = useDispatch();
  const translate = useTranslate();
  const trackers = useTrackers();
  const isLoggedOut = useSelector(getIsLoggedOut);

  const followPodcast = useCallback(() => {
    if (isLoggedOut) {
      dispatch(openSignupModal({ context: 'reg-gate' }));
    } else {
      dispatch(
        updateFollowed({
          followed: !followed,
          seedId,
        }),
      );

      // Braze Tracking event both registered and anonymous user
      trackers.track(followed ? Events.UnfollowPodcast : Events.FollowPodcast, {
        podcast: title,
        podcastId: seedId,
      });

      trackers.track(Events.Subscribe, {
        id: seedId,
        name: title,
        type: STATION_TYPE.PODCAST,
      });

      dispatch(
        showNotifyGrowl({
          title: translate('Followed {title}', { title }),
          icon: GrowlIcons.HeartFilled,
        }),
      );
    }
  }, [seedId, title]);

  const onRemove = useCallback(() => {
    toggleStationSaved(STATION_TYPE.PODCAST, seedId);

    dispatch(
      showNotifyGrowl({
        title: translate('Unfollowed {title}', { title }),
        icon: GrowlIcons.Deleted,
      }),
    );
  }, [seedId, title]);

  return (
    <TileDropdown data-test="podcast-tile-dropdown">
      <Menu>
        <Menu.List>
          <ShouldShow shouldShow={!followed}>
            <Menu.Item>
              <NavLink
                dataTest="podcast-follow-button"
                key={`follow-${seedId}`}
                onClick={followPodcast}
                title={translate('Follow Podcast')}
              >
                {translate('Follow Podcast')}
              </NavLink>
            </Menu.Item>
          </ShouldShow>
          <ShouldShow shouldShow={followed}>
            <Menu.Item>
              <NavLink
                dataTest="podcast-unfollow-button"
                key={`unFollow-${seedId}`}
                onClick={onRemove}
                title={translate('Unfollow Podcast')}
              >
                {translate('Unfollow Podcast')}
              </NavLink>
            </Menu.Item>
          </ShouldShow>
          <ShouldShow shouldShow={recentlyPlayed}>
            <Menu.Item>
              <NavLink
                key={`remove-${seedId}`}
                onClick={() =>
                  deleteFromListenHistory({
                    seedId,
                    stationType: STATION_TYPE.PODCAST,
                  })
                }
                title={translate('Delete')}
              >
                {translate('Delete')}
              </NavLink>
            </Menu.Item>
          </ShouldShow>
        </Menu.List>
      </Menu>
    </TileDropdown>
  );
}

export default Dropdown;
