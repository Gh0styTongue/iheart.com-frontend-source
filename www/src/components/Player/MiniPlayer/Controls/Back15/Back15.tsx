import Back15Icon from 'styles/icons/player/Controls/Back15/Back15Icon';
import Button from 'components/Player/primitives/Button';
import usePlayerActions from 'components/Player/PlayerActions/usePlayerActions';
import usePlayerState from 'contexts/PlayerState/usePlayerState';

function Back15() {
  const actions = usePlayerActions();
  const state = usePlayerState();

  return (
    <Button
      aria-label="Back15 Button"
      data-test="back-15-button"
      disabled={!state?.trackId}
      onClick={actions.back}
    >
      <Back15Icon />
    </Button>
  );
}

export default Back15;
