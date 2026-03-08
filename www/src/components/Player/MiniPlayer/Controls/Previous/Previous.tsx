import Button from 'components/Player/primitives/Button';
import PreviousIcon from 'styles/icons/player/Controls/Previous/PreviousIcon';
import usePlayerActions from 'components/Player/PlayerActions/usePlayerActions';
import usePlayerState from 'contexts/PlayerState/usePlayerState';

function Previous() {
  const actions = usePlayerActions();
  const state = usePlayerState();

  return (
    <Button
      aria-label="Previous Button"
      data-test="previous-button"
      disabled={!state?.trackId}
      onClick={actions.prev}
    >
      <PreviousIcon />
    </Button>
  );
}

export default Previous;
