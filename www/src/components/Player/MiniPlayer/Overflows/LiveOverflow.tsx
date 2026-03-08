import Controls from '../Controls';
import usePlayerActions from 'components/Player/PlayerActions/usePlayerActions';
import usePlayerState from 'contexts/PlayerState/usePlayerState';
import useTranslate from 'contexts/TranslateContext/useTranslate';
import { getIsFavoriteByTypeAndId } from 'state/Stations/selectors';
import { useSelector } from 'react-redux';
import type { State } from 'state/types';

function LiveOverflow() {
  const actions = usePlayerActions();
  const state = usePlayerState();
  const translate = useTranslate();
  const isFavorite = useSelector<State, boolean>(rdxState =>
    getIsFavoriteByTypeAndId(rdxState, {
      seedId: state?.stationId,
      seedType: state?.stationType,
    }),
  );

  return (
    <Controls.Overflow>
      <Controls.Overflow.Link
        aria-label="Go to Station Button"
        disabled={!state?.sourceUrl}
        to={state?.sourceUrl}
      >
        {translate('Go To Station')}
      </Controls.Overflow.Link>
      <Controls.Overflow.Button
        aria-label="Follow Station"
        disabled={!state?.sourceUrl}
        onClick={actions.favorite}
      >
        {isFavorite ?
          translate('Unfollow Station')
        : translate('Follow Station')}
      </Controls.Overflow.Button>
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

export default LiveOverflow;
