import { getFavoritesRadioUrl } from 'utils/url';
import { mapLiveStation, mapSeedStation } from 'web-player/mapper';
import { SUB_TYPES } from '../constants';

const { ARTIST, LIVE, TRACK, FAVORITES } = SUB_TYPES;

const mapStationContent = (rec: Record<string, any>) => {
  const { content, subType } = rec;
  const mapStation = subType === LIVE ? mapLiveStation : mapSeedStation;

  const mappingParams = {
    ...content,
    seedType: subType?.toLowerCase?.(),
  };

  if ([ARTIST, TRACK].includes(subType)) {
    mappingParams.seedId = content.id;
  } else if (subType === FAVORITES) {
    mappingParams.seedId = rec.contentId;
    mappingParams.url = getFavoritesRadioUrl(rec.slug);
  }

  return mapStation(mappingParams);
};

export default mapStationContent;
