import Circle from './primitives/Circle';
import Spinner from './primitives/Spinner';

function LoadingIcon({
  fill,
  stroke,
  size,
  strokeWidth,
}: {
  fill?: string;
  stroke?: string;
  size?: string;
  strokeWidth?: number;
}) {
  return (
    <Spinner
      aria-label="Loading Icon"
      fill="none"
      height="24"
      role="img"
      size={size}
      viewBox="0 0 24 24"
      width="24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <Circle
        cx={12}
        cy={12}
        fillColor={fill}
        r={11}
        strokeColor={stroke}
        strokeWidth={strokeWidth}
      />
    </Spinner>
  );
}

export default LoadingIcon;
