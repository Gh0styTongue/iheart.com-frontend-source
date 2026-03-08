import factory from 'state/factory';
import logger, { CONTEXTS, STATION_TYPE_CONTEXT_MAP } from 'modules/Logger';
import Media from 'web-player/models/Media';
import transport from 'api/transport';
import { concatTitleAndVersion } from 'utils/trackFormatter';
import { getAmpUrl, getHost } from 'state/Config/selectors';
import { getCurrentTrackHash } from 'state/Playlist/selectors';
import { postStreams } from 'state/Player/services';

const store = factory();

// AV - 3/7/18 - WEB-10774
// ticket to remove weblibjs/utils/common here: https://jira.ihrint.com/browse/WEB-10976
export function nextCustomTrack(
  station,
  profileId,
  sessionId,
  trackId,
  playedFrom,
) {
  const seedId = station.get('seedId');
  const { streamId, streamType } = station.getTrackStreamId();
  const state = store.getState();

  return transport(
    postStreams({
      ampUrl: getAmpUrl(state),
      host: getHost(state),
      playedFrom,
      profileId,
      // only pass on first playback/streams call of a station
      // if there is a seed set (meaning song2start or artist2start is enabled)
      seedInfo:
        station.get('isNew') && station.get('seed') ?
          station.get('seed')
        : undefined,
      sessionId,
      stationId: streamId,
      stationType: streamType,
      trackIds: [],
    }),
  ).then(resp => {
    const {
      data: { ageLimit, items: tracks },
    } = resp;
    if (!tracks) {
      const errObj = new Error(
        `no tracks for station of type ${station.get('seedType')}`,
      );
      // right now this code bails with a 404, which is the error passed by amp
      return logger.error(
        [
          CONTEXTS.PLAYBACK,
          CONTEXTS.CUSTOM,
          STATION_TYPE_CONTEXT_MAP[station.get('seedType')],
        ],
        errObj.message,
        {},
        errObj,
      );
    }

    const currentPlaylistTracks = getCurrentTrackHash(state);

    const trackModels = tracks.map(
      track =>
        new Media({
          album: track.content.album,
          albumId: track.content.albumId,
          artist: track.content.artistName,
          artistId: track.content.artistId,
          imagePath: track.content.imagePath,
          lyricsId: track.content.lyricsId,
          playbackRights: track.content.playbackRights,
          reportingKey: streamId,
          reportPayload: track.reportPayload,
          stationId: station.get('id'),
          stationSeedId: seedId,
          stationSeedType: station.get('seedType'),
          stream: {
            streamUrl: track.streamUrl,
            url: track.streamUrl,
          },
          title: concatTitleAndVersion(
            track.content.title,
            track.content.version,
          ),
          trackDuration: track.content.trackDuration,
          trackId: track.content.id,
          type: track.contentType.toLowerCase(),
          uniqueId: currentPlaylistTracks[track.content.id] ?? '',
        }),
    );

    return { tracks: trackModels, ageLimit };
  });
}
