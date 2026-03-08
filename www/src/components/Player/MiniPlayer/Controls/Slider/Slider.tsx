import Badge from '../LiveBar/primitives/Badge';
import Container from './primitives/Container';
import Progress from './primitives/Progress';
import Range from './primitives/Range';
import Track from './primitives/Track';
import {
  ChangeEvent,
  ReactElement,
  TouchEvent,
  useEffect,
  useState,
} from 'react';
import { noop } from 'lodash-es';

type Props = {
  children?: ReactElement;
  color?: string;
  max: number;
  onChange?: (value: number) => void;
  readonly?: boolean;
  text?: string;
  value: number;
};

function Slider({
  children,
  color,
  max,
  onChange = noop,
  readonly = false,
  text,
  value,
}: Props) {
  const [progress, setProgress] = useState<number>(value);
  const [dragging, setDragging] = useState<boolean>(false);

  useEffect(() => {
    if (dragging) return;
    setProgress(value);
  }, [value]);

  function onSlide(
    e: ChangeEvent<HTMLInputElement> | TouchEvent<HTMLInputElement>,
  ): void {
    setProgress(Number(e.currentTarget.value));
  }

  function onSlideStart(): void {
    setDragging(true);
  }

  function onSlideEnd(): void {
    setDragging(false);
    onChange(progress);
  }

  return (
    <Container readonly={readonly}>
      <Track />
      <Progress
        aria-label="Progress"
        color={color}
        style={{ width: `${(max > 0 ? progress / max : 0) * 100}%` }}
      >
        {!readonly && children}
      </Progress>
      <Range
        aria-label="Slider"
        disabled={readonly}
        max={max}
        min={0}
        onChange={onSlide}
        onMouseDown={onSlideStart}
        onMouseUp={onSlideEnd}
        onTouchEnd={onSlideEnd}
        onTouchStart={onSlideStart}
        role="slider"
        step={1}
        type="range"
        value={progress}
      />
      {!!text && (
        <Badge>
          <span>{text}</span>
        </Badge>
      )}
    </Container>
  );
}

export default Slider;
