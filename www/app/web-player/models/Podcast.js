import factory from 'state/factory';
import hub, { E } from 'shared/utils/Hub';
import Media from 'web-player/models/Media';
import Station from 'web-player/models/Station';
import transport from 'api/transport';
import { get } from 'lodash-es';
import { getAmpUrl, getHost, getStationSoftgate } from 'state/Config/selectors';
import { getCredentials } from 'state/Session/selectors';
import { getEpisode, getEpisodes, getPodcast } from 'state/Podcast/services';
import { getNextEpisode } from 'state/Podcast/selectors';
import { postStreams } from 'state/Player/services';
import { STATION_TYPE } from 'constants/stationTypes';

const store = factory();
function PodcastStation(attrs) {
  const stationSoftgates = getStationSoftgate(store.getState());
  Station.call(this, {
    feed: { regGate: stationSoftgates.podcast },
    type: STATION_TYPE.PODCAST,
    ...attrs,
  });
  if (!Array.isArray(this.get('episodes'))) this.set('episodes', []);
  return this;
}

PodcastStation.prototype = Object.create(Station.prototype);
PodcastStation.prototype.constructor = PodcastStation;
PodcastStation.prototype.idAttribute = 'seedId';

PodcastStation.prototype.fetch = function fetch() {
  const state = store.getState();
  const { profileId, sessionId } = getCredentials(state);
  const ampUrl = getAmpUrl(state);

  return Promise.all([
    transport(getPodcast(this.get('seedId'), ampUrl)).then(({ data }) => data),
    transport(
      getEpisodes({
        ampUrl,
        id: this.get('seedId'),
        limit: 200,
        profileId,
        sessionId,
      }),
    ).then(({ data }) => data),
  ]).then(([podcast, episodes]) =>
    this.set({
      ...podcast,
      episodes: episodes.data,
      name: podcast.title,
      nextPage: episodes.links.next,
      url: `/podcast/${podcast.slug}-${podcast.id}`,
    }),
  );
};

// we alias save to fetch, because we don't actually save, and there's a world
// where data will need to be filled by save rather than fetch, because
// playback is insane.
PodcastStation.prototype.save = PodcastStation.prototype.fetch;

PodcastStation.prototype.getNextPage = function getNextPage() {
  if (this.get('isAtLastPage')) return Promise.resolve();
  const state = store.getState();
  const { profileId, sessionId } = getCredentials(state);
  const ampUrl = getAmpUrl(state);

  return transport(
    getEpisodes({
      ampUrl,
      id: this.id,
      pageKey: this.get('nextPage'),
      profileId,
      sessionId,
    }),
  ).then(({ data }) => {
    const existingEpisodes = this.get('episodes');
    return this.set({
      episodes: [...existingEpisodes, ...data.data],
      isAtLastPage: !data.links.next,
      nextPage: data.links.next,
    });
  });
};

PodcastStation.prototype.fillToEpisode = function fillToEpisode(
  desiredId,
  creds,
) {
  // this is called if we request an episode that is not in the first 20 results,
  // it will retrieve the remaining episodes
  return this.getNextPage(creds)
    .then(() => this.get('episodes').find(({ id }) => id === desiredId))
    .then(
      episode =>
        episode ||
        this.get('isAtLastPage') ||
        this.fillToEpisode(desiredId, creds),
    );
};

PodcastStation.prototype.getEpisode = function getPodcastEpisode(id, creds) {
  const ampUrl = getAmpUrl(store.getState());

  return transport(getEpisode(id, ampUrl)).then(({ data }) => {
    if (this.get('episodes').length > 0)
      this.fillToEpisode(data.episode.id, creds);
    return data.episode;
  });
};

PodcastStation.prototype.getLatestTrack = function getLatestTrack(
  trackId,
  credentials,
) {
  if (trackId) {
    const episode = this.get('episodes').find(({ id }) => id === trackId);
    if (!episode) this.getNextPage();
    return episode ?
        Promise.resolve(episode)
      : this.getEpisode(trackId, credentials);
  }

  if (this.get('track')) {
    const episodes = this.get('episodes');
    const trackIndex = episodes.findIndex(
      ({ id }) => id === this.get('track').id,
    );
    if (trackIndex >= episodes.length - 2) this.getNextPage();
    // Check if there is a succeeding episode to play, otherwise play the first episdoe [WEB-8676]
    const nextTrack =
      episodes[trackIndex + 1] ? episodes[trackIndex + 1] : episodes[0];
    return Promise.resolve(nextTrack);
  }

  return this.getNextPage().then(() => this.get('episodes')[0]);
};

PodcastStation.prototype.getTrackStream = function getTrackStream(
  trackId,
  profileId,
  sessionId,
  playedFrom,
) {
  return this.getLatestTrack(trackId, { profileId, sessionId })
    .then(episode => {
      const state = store.getState();
      return Promise.all([
        transport(
          postStreams({
            ampUrl: getAmpUrl(state),
            host: getHost(state),
            playedFrom,
            profileId,
            sessionId,
            stationId: this.id,
            stationType: 'PODCAST',
            trackIds: [episode.id],
          }),
        ),
        episode,
      ]);
    })
    .then(
      ([
        {
          data: { items },
        },
        episode,
      ]) => {
        const streamData = items[0] || {};
        return new Media({
          episodeId: episode.id,
          isMedia: true,
          stationId: this.id,
          stationSeedType: STATION_TYPE.PODCAST,
          stream: { url: streamData.streamUrl },
          url: streamData.streamUrl,
          ...streamData,
          ...episode,
          type: STATION_TYPE.TALK_EPISODE, // eslint-disable-line
        });
      },
    );
};

PodcastStation.prototype.next = function next(
  profileId,
  sessionId,
  trackId,
  playedFrom,
) {
  // if there's no track ID, the podcast is flowing automatically from one track to the next without
  // the user explicity selecting a track. In this case, we'll see what the current order is
  // according to redux and let the player know

  const track = this.get('track');
  const nextTrack = getNextEpisode(store.getState(), { id: get(track, 'id') });

  if (this.get('isNew') || trackId || nextTrack) {
    return this.getTrackStream(
      trackId || nextTrack,
      profileId,
      sessionId,
      playedFrom,
    ).then(episode => ({
      tracks: episode,
    }));
  }
  // If no trackId from model, or no next track in queue (all episodes are completed)
  // Then stop and set track position === duration. Then reset player.
  hub.trigger(E.TIME, {
    duration: track.get('duration'),
    position: track.get('duration'),
  });

  hub.trigger(E.PLAYER_RESET_STATION);
  return Promise.resolve({ tracks: null });
};

export default PodcastStation;
