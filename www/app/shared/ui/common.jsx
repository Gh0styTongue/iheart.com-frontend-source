import { STATION_TYPE } from 'constants/stationTypes';

export function getDeeplink(seedType, seedId, episodeId) {
  switch (seedType) {
    case STATION_TYPE.LIVE:
      return {
        current: `listen/live_radio/${seedId}`,
        legacy: `play/live/${seedId}`,
        navigate: `goto/live/${seedId}`,
      };
    case STATION_TYPE.ARTIST:
      return {
        current: `listen/custom_radio/artist/${seedId}`,
        legacy: `play/custom/artist/${seedId}`,
      };
    case STATION_TYPE.ALBUM:
      return {
        current: `listen/custom_radio/album/${seedId}`,
        legacy: `play/custom/album/${seedId}`,
      };
    case STATION_TYPE.TRACK:
      return {
        current: `listen/custom_radio/track/${seedId}`,
        legacy: `play/custom/track/${seedId}`,
      };
    case STATION_TYPE.FEATURED:
      return {
        current: `listen/custom_radio/original/${seedId}`,
        legacy: `play/custom/original/${seedId}`,
      };
    case STATION_TYPE.PODCAST:
      return {
        current:
          episodeId ?
            `play/podcast/${seedId}/episode/${episodeId}`
          : `listen/custom_radio/talk/show/${seedId}`,
        legacy: `play/custom/talk/show/${seedId}`,
        navigate: `goto/talk/show/${seedId}`,
      };
    case STATION_TYPE.TALK_EPISODE:
      return {
        current: `play/podcast/${seedId}/episode/${episodeId}`,
        legacy: `play/custom/talk/show/${seedId}/episode/${episodeId}`,
      };
    case STATION_TYPE.FAVORITES:
      return {
        current: `listen/favorites/${seedId}`,
        legacy: `play/favorites/${seedId}`,
      };
    case 'genre':
      return {
        navigate: `/goto/genre/${seedId}`,
      };
    case STATION_TYPE.COLLECTION:
    case STATION_TYPE.PLAYLIST_RADIO:
      return {
        legacy: `play/playlist/${seedId}`,
        navigate: `play/playlist/${seedId}`,
      };
    case STATION_TYPE.MY_MUSIC:
      return {
        legacy: 'goto/mymusic',
        navigate: 'goto/mymusic',
      };
    default:
      return {
        current: '',
        legacy: '',
        navigate: '',
      };
  }
}

export function getAndroidDeepLink(seedType, seedId) {
  const deeplink = getDeeplink(seedType, seedId);
  return `android-app://com.clearchannel.iheartradio.controller/ihr/${deeplink.current}`;
}
