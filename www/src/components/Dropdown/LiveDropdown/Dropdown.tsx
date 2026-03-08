import NavLink from 'components/NavLink';
import ShouldShow from 'components/ShouldShow';
import TileDropdown from 'components/Tile/primitives/TileDropdown';
import useTranslate from 'contexts/TranslateContext/useTranslate';
import { GrowlIcons } from 'components/Growls/constants';
import { LiveStation } from 'state/Live/types';
import { Menu } from 'components/Tooltip';
import { REC_TYPE } from 'state/Recs/constants';
import { showNotifyGrowl } from 'state/UI/actions';
import { STATION_TYPE, StationTypeValue } from 'constants/stationTypes';
import { useCallback } from 'react';
import { useDispatch } from 'react-redux';

type Props = {
  deleteRecByTypeAndId: (
    type: string,
    id: string | number,
    dlType?: string,
  ) => Promise<void>;
  deleteFromListenHistory: ({
    seedId,
    stationId,
    stationType,
  }: {
    stationId?: number;
    seedId: number | string;
    stationType: StationTypeValue;
  }) => Promise<void>;
  isAnonymous: boolean;
  recentlyPlayed?: boolean;
  seedId: number | string;
  seedType: string;
  stations: {
    [id: string]: LiveStation;
  };
  name: string;
  tileType?: string;
  toggleStationSaved: (
    type: string,
    id: number | string,
    recentOnly?: boolean,
  ) => void;
};

function Dropdown({
  deleteRecByTypeAndId,
  deleteFromListenHistory,
  isAnonymous,
  name,
  recentlyPlayed,
  seedId,
  seedType,
  stations,
  tileType,
  toggleStationSaved,
}: Props) {
  const dispatch = useDispatch();
  const translate = useTranslate();

  const followLive = useCallback(() => {
    toggleStationSaved(seedType, seedId);
    if (!isAnonymous) {
      dispatch(
        showNotifyGrowl({
          title: translate('Saved {name} to Your Library', { name }),
          icon: GrowlIcons.HeartFilled,
        }),
      );
    }
  }, []);

  const onRemove = useCallback(() => {
    toggleStationSaved(seedType, seedId);
    if (!isAnonymous) {
      dispatch(
        showNotifyGrowl({
          title: translate('Removed {name} from Your Library', { name }),
          icon: GrowlIcons.Deleted,
        }),
      );
    }
  }, []);

  const onDismissRec = () => {
    deleteRecByTypeAndId(seedType, seedId);
  };

  const favoriteIds = Object.keys(stations).filter(id => stations[id].favorite);

  return (
    <TileDropdown data-test="station-tile-dropdown">
      <Menu>
        <Menu.List>
          <ShouldShow shouldShow={!favoriteIds.includes(String(seedId))}>
            <Menu.Item>
              <NavLink
                dataTest="save-station"
                key={`save|${seedId}`}
                onClick={followLive}
                title={translate('Follow station')}
              >
                {translate('Follow station')}
              </NavLink>
            </Menu.Item>
          </ShouldShow>
          <ShouldShow shouldShow={favoriteIds.includes(String(seedId))}>
            <Menu.Item>
              <NavLink
                dataTest="remove-station"
                key={`remove|${seedId}`}
                onClick={onRemove}
                title={translate('Unfollow station')}
              >
                {translate('Unfollow station')}
              </NavLink>
            </Menu.Item>
          </ShouldShow>
          <ShouldShow shouldShow={tileType === REC_TYPE.RECOMMENDATION}>
            <Menu.Item>
              <NavLink
                key={`notForMe|${seedId}`}
                onClick={() => onDismissRec()}
                title={translate('Not for Me')}
              >
                {translate('Not for Me')}
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
                    stationType: STATION_TYPE.LIVE,
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
