import { STATION_TYPE } from 'constants/stationTypes';
import type { IGetTranslateFunctionResponse } from 'redux-i18n';

export const getSourceTypeName = (
  translate: IGetTranslateFunctionResponse,
) => ({
  [STATION_TYPE.LIVE]: translate('Live Radio'),
  [STATION_TYPE.CUSTOM]: translate('Artist Radio'),
  [STATION_TYPE.ARTIST]: translate('Artist Radio'),
  [STATION_TYPE.TRACK]: translate('Artist Radio'),
  [STATION_TYPE.ALBUM]: translate('Artist Radio'),
  [STATION_TYPE.FAVORITES]: translate('Favorites Radio'),
  [STATION_TYPE.MY_MUSIC]: translate('My Music'),
  [STATION_TYPE.FEATURED]: translate('Theme Radio'),
  [STATION_TYPE.COLLECTION]: translate('Playlist'),
  [STATION_TYPE.PLAYLIST_RADIO]: translate('Playlist by'),
  [STATION_TYPE.TALK]: translate('Podcast'),
  [STATION_TYPE.TALK_EPISODE]: translate('Podcast'),
  [STATION_TYPE.PODCAST]: translate('Podcast'),
});

export const getTextUrlPair = (
  firstChoiceText: string | undefined,
  firstChoiceUrl: string,
  fallbackText: string,
  fallbackUrl: string,
) =>
  firstChoiceText ?
    { text: firstChoiceText, url: firstChoiceUrl }
  : { text: fallbackText, url: fallbackUrl };
