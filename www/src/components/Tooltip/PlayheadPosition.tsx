import formatSecondsIntoDuration from 'components/Player/MiniPlayer/Controls/SeekBar/formatSecondsIntoDuration';
import usePlayerTime from 'contexts/PlayerTime/usePlayerTime';

export default function PlayheadPosition() {
  const time = usePlayerTime();
  const formattedTime = formatSecondsIntoDuration(time.position);

  return <b>{formattedTime}</b>;
}
