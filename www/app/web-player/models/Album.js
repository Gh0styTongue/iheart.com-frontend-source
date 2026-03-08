import factory from 'state/factory';
import logger, { CONTEXTS } from 'modules/Logger';
import Media from 'web-player/models/Media';
import Station from 'web-player/models/Station';
import transport from 'api/transport';
import { concatTitleAndVersion } from 'utils/trackFormatter';
import { getAlbumByAlbumId } from 'state/Albums/services';
import { getAmpUrl, getHost } from 'state/Config/selectors';
import { postStreams } from 'state/Player/services';

const store = factory();

function AlbumStation(attrs = {}) {
  Station.call(this, {
    type: 'album',
    ...attrs,
    failures: new Map(),
  });
  this.idAttribute = 'seedId';
  this.id = attrs.seedId;
}

AlbumStation.prototype = Object.create(Station.prototype);
AlbumStation.prototype.constructor = AlbumStation;

// Function to find the first song when provided for the start of playback
AlbumStation.prototype.getStartTrack = function getStartTrack(trackId) {
  const playlist = this.get('playlist') || [];

  // get all the song ids
  const songIds = playlist.map(track => track.id);

  // if the track is included, get it, if not, return 0 so it starts from the top
  return songIds.includes(trackId) ? songIds.indexOf(trackId) : 0;
};

// altered form of Station.prototype.next because we don't want to mutate the playlist to allow
// it to loop without refetching the track, includes some naive early support for reordering
// also forward/backward
AlbumStation.prototype.next = function next(
  profileId,
  sessionId,
  currentTrack,
  playedFrom,
) {
  // we cannot rely on default arguments because it is possible in certain circumstances
  // for currentTrack to come back as null (found as part of WEB-7422).
  let trackIndex = currentTrack;
  if (currentTrack === undefined || currentTrack === null)
    trackIndex = this.currentIndex;

  this.set('playedFrom', playedFrom);
  const isNew = this.get('isNew');
  const playlist = this.get('playlist') || [];

  if (!playlist.length || playlist.length <= this.get('failures').size) {
    return Promise.reject(new Error('This station has no playable track'));
  }

  // get the next track index
  // if a new play don't increment or start from the beginning if no track id is provided
  const nextTrack =
    isNew && !this.get('failures').size ?
      this.getStartTrack(trackIndex)
    : trackIndex + 1;
  this.currentIndex = nextTrack;

  // if we are out of tracks start over from the beginning
  let track;
  if (playlist[nextTrack]) {
    track = playlist[nextTrack].set('reported', {});
  } else {
    track = playlist[0].set('reported', {});
    this.currentIndex = 0;
  }

  return this.getStream(track, { profileId, sessionId })
    .then(newTrack => ({ tracks: newTrack }))
    .catch(err => {
      const errObj = err instanceof Error ? err : new Error(err);
      logger.error(
        [CONTEXTS.PLAYBACK, CONTEXTS.OD, CONTEXTS.ALBUM],
        err,
        {},
        errObj,
      );
      if (err.code === 403 || err.response.status === 403) {
        return Promise.reject(err);
      }

      return this.next(
        profileId,
        sessionId,
        this.currentIndex,
        this.get('playedFrom'),
      );
    });
};

AlbumStation.prototype.fetch = function fetch(state = store.getState()) {
  const ampUrl = getAmpUrl(state);
  return transport(getAlbumByAlbumId({ albumId: this.id, ampUrl }))
    .then(({ data }) => data.trackBundles[0])
    .then(albumData => {
      const parseables = {
        ...albumData,
        name: albumData.title,
        seedId: this.id,
        seedType: 'album',
        type: 'album',
      };

      this.set(this.parse(parseables));
      return albumData;
    })
    .then(({ tracks = [] }) => {
      const songs = tracks.map(
        ({
          trackId,
          trackDuration,
          imagePath,
          artist,
          artistId,
          album,
          title,
          albumId,
          playbackRights,
          version,
        }) =>
          new Media({
            album,
            albumId,
            artist,
            artistId,
            duration: trackDuration,
            imagePath,
            playbackRights,
            stationId: this.id,
            stationSeedId: this.get('seedId'),
            stationSeedType: this.get('seedType'),
            title: concatTitleAndVersion(title, version),
            trackId,
          }),
      );

      // we return this for compatibility with existing api
      return this.set('playlist', songs);
    });
};

AlbumStation.prototype.getStream = function getStream(
  track,
  { profileId, sessionId } = {},
) {
  // return if we already have the stream object defined
  if (track.get('stream')) {
    return Promise.resolve(track);
  }

  const state = store.getState();

  return transport(
    postStreams({
      ampUrl: getAmpUrl(state),
      host: getHost(state),
      playedFrom: this.get('playedFrom'),
      profileId,
      sessionId,
      stationId: this.id,
      stationType: 'ALBUM',
      trackIds: [track.id],
    }),
  ).then(({ data: { items = [] } }) => {
    const { streamUrl, reportPayload, content = {} } = items[0] || {};
    const { lyricsId } = content;

    if (streamUrl) {
      return track.set({
        lyricsId,
        reportPayload,
        stream: {
          type: 'hls',
          url: streamUrl,
        },
      });
    }

    // if there is no streamUrl reject because this track is not in
    // the catalog
    const failures = this.get('failures');
    this.set('failures', failures.set(track.get('trackId'), 1));
    return Promise.reject();
  });
};

AlbumStation.prototype.save = function save(
  profileId,
  sessionId,
  { playedFrom } = {},
) {
  // code to calculate playedFrom values exists at https://github.com/iheartradio/web-player/blob/master/lib/controllers/Station.js#L27-L43
  // replicating it here doesn't appear to change behavior, but if necessary we can move it to ensure that playedFrom is available for calls to next
  this.set('playedFrom', playedFrom);

  // saving is called as part of a separate instantitaion flow,
  // however we don't persist playlist history in the same way, so all save requires
  // is a refetch of the data
  return this.fetch();
};

AlbumStation.prototype.previous = function previous(creds = {}) {
  const playlist = this.get('playlist');
  const newIndex =
    (this.currentIndex === 0 ? playlist.length : this.currentIndex) - 1;
  // ensure reported is set to empty object
  const track = playlist[newIndex].set('reported', {});
  this.currentIndex = newIndex;
  return this.getStream(track, creds).catch(err => {
    const errObj = err instanceof Error ? err : new Error(err);
    logger.error(
      [CONTEXTS.PLAYBACK, CONTEXTS.OD, CONTEXTS.ALBUM],
      err,
      {},
      errObj,
    );
    if (err.code === 403) {
      return Promise.reject(err);
    }

    return this.previous(creds);
  });
};

export default AlbumStation;
