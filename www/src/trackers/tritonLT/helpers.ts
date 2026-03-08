import { STATION_TYPE } from 'constants/stationTypes';
import type { State as Profile } from 'state/Profile/types';

enum TRITON_STATION_TYPES {
  custom = 'custom',
  talk = 'talk',
}
type Config = { custom: string; talk: string };

export const createCacheBust = () => Math.trunc(Math.random() * 9999999);

export const getCurrentTritonType = (
  currentType: string,
): TRITON_STATION_TYPES => {
  const map = {
    [STATION_TYPE.ALBUM]: TRITON_STATION_TYPES.custom,
    [STATION_TYPE.CUSTOM]: TRITON_STATION_TYPES.custom,
    [STATION_TYPE.COLLECTION]: TRITON_STATION_TYPES.custom,
    [STATION_TYPE.TRACK]: TRITON_STATION_TYPES.custom,
    [STATION_TYPE.PLAYLIST_RADIO]: TRITON_STATION_TYPES.custom,
    [STATION_TYPE.FAVORITES]: TRITON_STATION_TYPES.custom,
    [STATION_TYPE.MY_MUSIC]: TRITON_STATION_TYPES.custom,
    [STATION_TYPE.PODCAST]: TRITON_STATION_TYPES.talk,
  };

  return map[currentType];
};

export const getProfileParams = ({ birthYear, gender }: Profile) => {
  const profileParams: { yob?: number; gender?: string } = {};
  if (birthYear) profileParams.yob = birthYear;
  if (gender?.length) {
    // Convert gender to just M or F
    profileParams.gender = gender.charAt(0);
  }
  return profileParams;
};

export const getSid = (type: string, config?: Config) =>
  config?.[getCurrentTritonType(type)];
