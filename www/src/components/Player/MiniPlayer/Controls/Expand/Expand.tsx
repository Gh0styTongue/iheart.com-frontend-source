import Button from 'components/Player/primitives/Button';
import ExpandIcon from 'styles/icons/player/Controls/Expand/ExpandIcon';
import { setIsFSPOpen } from 'state/UI/actions';
import { useDispatch } from 'react-redux';

function Expand() {
  const dispatch = useDispatch();

  return (
    <Button
      aria-label="Expand Button"
      data-test="expand-button"
      onClick={() => dispatch(setIsFSPOpen(true))}
    >
      <ExpandIcon />
    </Button>
  );
}

export default Expand;
