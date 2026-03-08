import Dropdown from './Dropdown';
import getUser from 'state/User/selectors';
import saveAlbum from 'state/YourLibrary/saveAlbum';
import { albumOverflowsSelector } from 'state/Artists/selectors';
import { connect } from 'react-redux';
import { createStructuredSelector } from 'reselect';
import {
  getAllAccessPreview,
  saveAlbumOverflowSelector,
} from 'state/Entitlements/selectors';
import { getCountryCode, getStationSoftgate } from 'state/Config/selectors';
import { getIsAnonymous, getIsLoggedOut } from 'state/Session/selectors';
import { State } from 'state/types';
import { StationSoftgate } from 'state/Config/types';
import type { User } from 'state/User/types';

type ConnectedProps = {
  allAccessPreview: boolean;
  countryCode: string;
  isAnonymous: boolean;
  isLoggedOut: boolean;
  overflowEntitlements: { show: boolean; showAdd: boolean; showSave: boolean };
  saveAlbumOverflow: boolean;
  stationSoftgate: StationSoftgate;
  user: User;
};

export default connect(
  createStructuredSelector<State, ConnectedProps>({
    allAccessPreview: getAllAccessPreview,
    countryCode: getCountryCode,
    isAnonymous: getIsAnonymous,
    isLoggedOut: getIsLoggedOut,
    overflowEntitlements: albumOverflowsSelector,
    saveAlbumOverflow: saveAlbumOverflowSelector,
    stationSoftgate: getStationSoftgate,
    user: getUser,
  }),
  { saveAlbum: saveAlbum.action },
)(Dropdown);
