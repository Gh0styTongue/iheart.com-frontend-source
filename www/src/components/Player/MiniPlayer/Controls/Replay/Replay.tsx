import Button from 'components/Player/primitives/Button';
import ReplayIcon from 'styles/icons/player/Controls/Replay/ReplayIcon';
import ReplayModal from 'components/ReplayModal';
import useModal from 'hooks/useModal';
import usePlayerState from 'contexts/PlayerState/usePlayerState';

function Replay() {
  const [Modal, toggle] = useModal();
  const state = usePlayerState();

  if (!state?.showReplay) return null;

  return (
    <>
      <Button
        aria-label="Replay Button"
        data-test="replay-button"
        data-test-state={state?.canReplay}
        disabled={!state?.canReplay}
        onClick={toggle}
      >
        <ReplayIcon />
      </Button>
      <Modal>
        <Modal.Container>
          <Modal.Content css={{ width: 'auto' }}>
            <ReplayModal close={toggle} />
          </Modal.Content>
        </Modal.Container>
      </Modal>
    </>
  );
}

export default Replay;
