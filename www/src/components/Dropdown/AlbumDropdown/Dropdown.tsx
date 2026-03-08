import countryCodes from 'constants/countryCodes';
import NavLink from 'components/NavLink';
import ShouldShow from 'components/ShouldShow';
import TileDropdown from 'components/Tile/primitives/TileDropdown';
import useTranslate from 'contexts/TranslateContext/useTranslate';
import { addAlbumToPlaylist } from 'state/Playlist/actions';
import { get } from 'lodash-es';
import { GrowlIcons } from 'components/Growls/constants';
import { Menu } from 'components/Tooltip';
import { openSignupModal, showNotifyGrowl } from 'state/UI/actions';
import {
  SaveDeleteComponent,
  SaveDeleteView,
} from 'modules/Analytics/helpers/saveDelete';
import { STATION_TYPE } from 'constants/stationTypes';
import { StationSoftgate } from 'state/Config/types';
import { useCallback } from 'react';
import { useDispatch } from 'react-redux';

type Props = {
  albumId: number;
  countryCode: string;
  overflowEntitlements: Record<string, any>;
  allAccessPreview: boolean;
  isAnonymous: boolean;
  isLoggedOut: boolean;
  saveAlbum: (id: number) => void;
  saveAlbumOverflow: boolean;
  stationSoftgate: StationSoftgate;
  view?: SaveDeleteView;
};

const openSignup = (context = 'all_access_Preview') =>
  openSignupModal({ context });

function Dropdown({
  albumId,
  allAccessPreview,
  countryCode,
  overflowEntitlements,
  isAnonymous,
  isLoggedOut,
  saveAlbum,
  saveAlbumOverflow,
  stationSoftgate,
  view = SaveDeleteView.ArtistProfile,
}: Props) {
  const enableAddToPlaylist =
    countryCode === countryCodes.US || countryCode === countryCodes.CA;
  const dispatch = useDispatch();
  const translate = useTranslate();

  const onAddToPlaylist = useCallback(() => {
    dispatch(
      addAlbumToPlaylist({
        albumId,
        view,
        component: SaveDeleteComponent.ListAlbumsOverflow,
      }),
    );
  }, [albumId, dispatch, view]);

  const onAddToYourLibrary = useCallback(() => {
    const hasSoftgate = get(stationSoftgate, STATION_TYPE.ARTIST);

    if (allAccessPreview && isAnonymous) {
      dispatch(openSignup());
    } else if (isLoggedOut && hasSoftgate) {
      dispatch(openSignup('reg-gate'));
    } else if (saveAlbumOverflow) {
      saveAlbum(albumId);

      dispatch(
        showNotifyGrowl({
          title: translate('Album saved to Your Library'),
          icon: GrowlIcons.HeartFilled,
        }),
      );
    }
  }, [albumId]);

  if (!enableAddToPlaylist && !overflowEntitlements.showSave) return null;
  return (
    <TileDropdown>
      <Menu>
        <Menu.List>
          <ShouldShow shouldShow={overflowEntitlements.showSave}>
            <Menu.Item>
              <NavLink
                key="addToMyMusic"
                onClick={onAddToYourLibrary}
                title={translate('Save Album')}
                underline
              >
                {translate('Save Album')}
              </NavLink>
            </Menu.Item>
          </ShouldShow>
          <ShouldShow shouldShow={enableAddToPlaylist}>
            <Menu.Item>
              <NavLink
                key="addToPlaylist"
                onClick={onAddToPlaylist}
                title={translate('Add to Playlist')}
                underline
              >
                {translate('Add to Playlist')}
              </NavLink>
            </Menu.Item>
          </ShouldShow>
        </Menu.List>
      </Menu>
    </TileDropdown>
  );
}

export default Dropdown;
