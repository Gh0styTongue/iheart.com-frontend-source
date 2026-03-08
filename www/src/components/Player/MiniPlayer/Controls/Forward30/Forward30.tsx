import Button from 'components/Player/primitives/Button';
import Forward30Icon from 'styles/icons/player/Controls/Forward30/Forward30Icon';
import usePlayerActions from 'components/Player/PlayerActions/usePlayerActions';
import usePlayerState from 'contexts/PlayerState/usePlayerState';

function Forward30() {
  const actions = usePlayerActions();
  const state = usePlayerState();

  return (
    <Button
      aria-label="Forward30 Button"
      data-test="forward-30-button"
      disabled={!state?.trackId}
      onClick={actions.forward}
    >
      <Forward30Icon />
    </Button>
  );
}

export default Forward30;
