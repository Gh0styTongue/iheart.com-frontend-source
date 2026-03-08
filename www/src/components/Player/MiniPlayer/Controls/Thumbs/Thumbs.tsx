import Button from 'components/Player/primitives/Button';
import Container from './primitives/Container';
import DownIcon from 'styles/icons/player/Controls/Thumbs/DownIcon';
import UpIcon from 'styles/icons/player/Controls/Thumbs/UpIcon';
import usePlayerActions from 'components/Player/PlayerActions/usePlayerActions';
import usePlayerState from 'contexts/PlayerState/usePlayerState';
import { StationType } from 'components/Player/MiniPlayer/types';

type Props = {
  className?: string;
};

const DO_NOT_THUMB = [
  StationType.Album,
  StationType.MyMusic,
  StationType.Podcast,
];

function Thumbs({ className }: Props) {
  const actions = usePlayerActions();
  const state = usePlayerState();

  if (DO_NOT_THUMB.includes(state?.stationType as StationType)) return null;

  return (
    <Container className={className}>
      <Button
        aria-label="Thumb Down"
        data-test="thumb-down"
        data-test-state={state?.thumbable}
        disabled={!state?.thumbable}
        onClick={actions.thumbDown}
      >
        <DownIcon filled={state?.sentiment === -1} />
      </Button>
      <Button
        aria-label="Thumb Up"
        data-test="thumb-up"
        data-test-state={state?.thumbable}
        disabled={!state?.thumbable}
        onClick={actions.thumbUp}
      >
        <UpIcon filled={state?.sentiment === 1} />
      </Button>
    </Container>
  );
}

export default Thumbs;
