import PLAYED_FROM from 'modules/Analytics/constants/playedFrom';
import { createSelector } from 'reselect';
import { encodePlaylistSeedId } from 'state/Playlist/helpers';
import { getCanPlay } from 'state/Playlist/selectors';
import { getForYouRecs } from 'state/Recs/selectors';
import { getListenHistory } from 'state/Stations/selectors';
import { listContainsStation } from './helpers';
import { merge, uniqBy } from 'lodash-es';
import { REC_TYPE } from 'state/Recs/constants';
import { STATION_TYPE } from 'constants/stationTypes';

export const getFilteredListenHistory = createSelector(
  getListenHistory,
  listenHistory =>
    listenHistory
      .filter(
        station =>
          station &&
          station.type !== 'mymusic' &&
          station.lastPlayedDate !== null,
      )
      .map(station => ({
        ...station,
        imgUrl: station.imageUrl || station.imgUrl,
        playedFrom: PLAYED_FROM.HOME_RECENT,
      })),
);

export const getStandardizedRecs = createSelector(
  getCanPlay,
  getForYouRecs,
  (canPlayPlaylist, recs) => {
    const mapped = recs.map(r => {
      const reasonId =
        parseInt(Object.keys(r?.basedOn ?? '0')[0], 10) || undefined;
      const playlistId = r?.content?.playlistId ?? '';
      const userId = r?.content?.ownerId ?? 0;
      const reasonType = r?.basedOn?.[reasonId] ?? undefined;

      return merge(
        {},
        r?.content ?? {},
        {
          imgUrl: r?.content?.logo || r?.content?.rawLogo || r?.imagePath,
          imgWidth: 240,
          playedFrom: PLAYED_FROM.HOME_RECS,
          reasonId,
          reasonType,
          tileType: 'recommendation',
        },
        [REC_TYPE.CURATED, REC_TYPE.N4U].includes(r?.content?.responseType) ?
          {
            contentId: r?.contentId,
            id: playlistId,
            noPlay: !canPlayPlaylist,
            recType: r?.type,
            seedId: encodePlaylistSeedId(userId, playlistId),
            seedType: STATION_TYPE.COLLECTION,
            url: (
              (r?.content?.webLink ?? '') ||
              (r?.content?.contentLink ?? '')
            ).split('.com')[1],
          }
        : {},
      );
    });

    return uniqBy(mapped, ({ id }) => id);
  },
);

export const getProcessedRecs = createSelector(
  getFilteredListenHistory,
  getStandardizedRecs,
  (history, recommendations) => {
    const topHistoryStations = history.slice(0, 3);
    const output = recommendations.filter(
      recStation => !listContainsStation(topHistoryStations, recStation),
    );
    topHistoryStations.forEach((station, index) =>
      output.splice(index * 4, 0, station),
    );
    return output;
  },
);
