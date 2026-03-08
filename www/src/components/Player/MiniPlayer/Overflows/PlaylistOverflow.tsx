import Controls from '../Controls';
import usePlayerActions from 'components/Player/PlayerActions/usePlayerActions';
import usePlayerState from 'contexts/PlayerState/usePlayerState';
import useTranslate from 'contexts/TranslateContext/useTranslate';

function PlaylistOverflow() {
  const actions = usePlayerActions();
  const state = usePlayerState();
  const translate = useTranslate();

  return (
    <Controls.Overflow>
      <Controls.Overflow.Link
        aria-label="Go to Playlist Link"
        disabled={!state?.sourceUrl}
        to={state?.sourceUrl}
      >
        {translate('Go To Playlist')}
      </Controls.Overflow.Link>
      <Controls.Overflow.Link
        aria-label="Go to Artist Link"
        disabled={!state?.artistUrl}
        to={state?.artistUrl}
      >
        {translate('Go To Artist')}
      </Controls.Overflow.Link>
      <Controls.Overflow.Button
        aria-label="Share Button"
        data-test="share-button"
        onClick={actions.share}
      >
        {translate('Share')}
      </Controls.Overflow.Button>
      <Controls.Overflow.Link
        aria-label="Lyrics Link"
        disabled={!state?.lyricsUrl}
        to={state?.lyricsUrl}
      >
        {translate('Lyrics')}
      </Controls.Overflow.Link>
    </Controls.Overflow>
  );
}

export default PlaylistOverflow;
