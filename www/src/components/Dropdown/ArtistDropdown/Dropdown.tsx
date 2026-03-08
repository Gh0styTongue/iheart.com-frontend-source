import NavLink from 'components/NavLink';
import ShouldShow from 'components/ShouldShow';
import TileDropdown from 'components/Tile/primitives/TileDropdown';
import useTranslate from 'contexts/TranslateContext/useTranslate';
import { Artist } from 'state/Artists/types';
import { GrowlIcons } from 'components/Growls/constants';
import { Menu } from 'components/Tooltip';
import { REC_TYPE } from 'state/Recs/constants';
import { showNotifyGrowl } from 'state/UI/actions';
import { STATION_TYPE } from 'constants/stationTypes';
import { useCallback } from 'react';
import { useDispatch } from 'react-redux';

type Props = {
  artist: Artist;
  deleteRecByTypeAndId: (
    type: string,
    id: string | number,
    dlType?: string,
  ) => void;
  deleteFromListenHistory: ({
    seedId,
    stationId,
    stationType,
  }: {
    seedId: number;
    stationId: string;
    stationType: string;
  }) => void;
  followed: boolean;
  isAnonymous: boolean;
  recentlyPlayed: boolean;
  toggleStationSaved: (type: string, id: number, recentOnly?: boolean) => void;
  tileType?: string;
};

function Dropdown({
  artist,
  deleteRecByTypeAndId,
  deleteFromListenHistory,
  followed,
  isAnonymous,
  recentlyPlayed,
  tileType,
  toggleStationSaved,
}: Props) {
  const { seedId, seedType, stationId, name } = artist;
  const dispatch = useDispatch();
  const translate = useTranslate();

  const followArtist = useCallback(() => {
    toggleStationSaved(seedType, seedId);
    if (!isAnonymous) {
      dispatch(
        showNotifyGrowl({
          title: translate('Saved {name} to Your Library', { name }),
          icon: GrowlIcons.HeartFilled,
        }),
      );
    }
  }, [seedType, seedId, name]);

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
  }, [seedType, seedId, name]);

  const onDismissRec = () => {
    deleteRecByTypeAndId(seedType, seedId);
  };

  return (
    <TileDropdown data-test="artist-tile-dropdown">
      <Menu>
        <Menu.List>
          <ShouldShow shouldShow={!followed}>
            <Menu.Item>
              <NavLink
                key={`save|${seedId}`}
                onClick={followArtist}
                title={translate('Follow Artist')}
              >
                {translate('Follow Artist')}
              </NavLink>
            </Menu.Item>
          </ShouldShow>
          <ShouldShow shouldShow={followed}>
            <Menu.Item>
              <NavLink
                dataTest="remove-artist"
                key={`remove|${seedId}`}
                onClick={onRemove}
                title={translate('Remove Artist')}
              >
                {translate('Remove Artist')}
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
                key={`delete|${seedId}`}
                onClick={() =>
                  deleteFromListenHistory({
                    seedId,
                    stationId,
                    stationType: STATION_TYPE.ARTIST,
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
