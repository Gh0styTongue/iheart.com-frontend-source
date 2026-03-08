import Digit from './primitives/Digit';
import Overflow from '../Overflow';
import usePlayerActions from 'components/Player/PlayerActions/usePlayerActions';
import usePlayerColor from 'contexts/PlayerColor/usePlayerColor';
import { useEffect, useRef, useState } from 'react';

enum Speeds {
  ZeroPointFive = 0.5,
  OnePointZero = 1.0,
  OnePointTwoFive = 1.25,
  OnePointFive = 1.5,
  TwoPointZero = 2.0,
}

function Speed() {
  const actions = usePlayerActions();
  const [speed, setSpeed] = useState<Speeds>(Speeds.OnePointZero);
  const prevSpeed = useRef<undefined | Speeds>();
  const { playerColor } = usePlayerColor();

  useEffect(() => {
    actions.changeSpeed(speed, prevSpeed.current);
    prevSpeed.current = speed;

    return () => actions.changeSpeed(Speeds.OnePointZero);
  }, [actions, speed]);

  return (
    <Overflow target={<Digit color={playerColor}>{`${speed}x`}</Digit>}>
      {(Object.values(Speeds) as Array<Speeds>)
        .filter(value => typeof value === 'number')
        .map(value => (
          <Overflow.Button
            aria-label={`${value}x Speed`}
            key={value}
            onClick={() => setSpeed(value)}
          >
            {`${value}x`}
          </Overflow.Button>
        ))}
    </Overflow>
  );
}

export default Speed;
