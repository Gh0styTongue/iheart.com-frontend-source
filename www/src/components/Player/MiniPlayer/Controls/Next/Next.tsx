import Button from 'components/Player/primitives/Button';
import NextIcon from 'styles/icons/player/Controls/Next/NextIcon';
import usePlayerActions from 'components/Player/PlayerActions/usePlayerActions';
import usePlayerState from 'contexts/PlayerState/usePlayerState';
import { useAdsPlayerState } from 'ads';

function Next() {
  const actions = usePlayerActions();
  const state = usePlayerState();
  const { adIsPresent } = useAdsPlayerState();

  return (
    <Button
      aria-label="Next Button"
      data-test="next-button"
      disabled={!state?.trackId || adIsPresent}
      onClick={actions.next}
    >
      <NextIcon />
    </Button>
  );
}

export default Next;
