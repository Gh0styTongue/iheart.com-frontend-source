import analytics from 'modules/Analytics';
import Controls from '../Controls';
import PlayheadPosition from 'components/Tooltip/PlayheadPosition';
import usePlayerActions from 'components/Player/PlayerActions/usePlayerActions';
import usePlayerState from 'contexts/PlayerState/usePlayerState';
import useTranslate from 'contexts/TranslateContext/useTranslate';
import { getPodcastTranscriptionsEnabled } from 'state/Features/selectors';
import { useEffect, useState } from 'react';
import { useSelector, useStore } from 'react-redux';
import type { State } from 'state/types';

function PodcastOverflow() {
  const actions = usePlayerActions();
  const playerState = usePlayerState();
  const store = useStore();
  const state = store.getState();
  const translate = useTranslate();
  const [episodeTranscriptionAvailable, setEpisodeTranscriptionAvailable] =
    useState<boolean>(false);

  const { pageName } = window.analyticsData?.events?.active ?? 'miniplayer';
  const showPodcastTranscriptions = useSelector<State, boolean>(
    getPodcastTranscriptionsEnabled,
  );
  const followed = useSelector<State, boolean>(s =>
    playerState?.stationId ?
      s.podcast.shows[playerState.stationId].followed
    : false,
  );
  useEffect(() => {
    if (playerState?.trackId) {
      const episode = state.podcast.episodes[playerState.trackId];

      setEpisodeTranscriptionAvailable(
        episode?.transcriptionAvailable ?? false,
      );
    }
  }, [playerState, state]);

  return (
    <Controls.Overflow>
      <Controls.Overflow.Link
        aria-label="Episode Info Link"
        disabled={!playerState?.episodeUrl}
        to={playerState?.episodeUrl}
      >
        {translate('Episode Info')}
      </Controls.Overflow.Link>
      <Controls.Overflow.Button
        aria-label="Share Button"
        data-test="share-button"
        disabled={!playerState?.episodeUrl}
        onClick={() => {
          actions.share();
        }}
      >
        {translate('Share Episode')}
      </Controls.Overflow.Button>
      <Controls.Overflow.Button
        aria-label="Share From Timestamp Button"
        data-test="share-timestamp-button"
        disabled={!playerState?.episodeUrl}
        onClick={() => {
          actions.share(true);
        }}
      >
        {translate('Share from')} <PlayheadPosition />
      </Controls.Overflow.Button>
      <Controls.Overflow.Link
        aria-label="Follow Button"
        data-test="follow-button"
        onClick={actions.toggleFollowed}
      >
        {followed ? translate('Unfollow Podcast') : translate('Follow Podcast')}
      </Controls.Overflow.Link>
      {showPodcastTranscriptions && episodeTranscriptionAvailable && (
        <Controls.Overflow.Link
          aria-label="Episode Transcription Link"
          disabled={!playerState?.episodeUrl}
          onClick={() =>
            analytics.trackClick?.(
              `${pageName}|miniplayer_overflow_menu|transcription_option`,
            )
          }
          to={playerState?.episodeUrl}
        >
          {translate('Transcript')}
        </Controls.Overflow.Link>
      )}
    </Controls.Overflow>
  );
}

export default PodcastOverflow;
