import theme from 'styles/themes/default';
import type { MouseEvent } from 'react';

type Props = {
  'data-test'?: string;
  className?: string;
  height?: string;
  width?: string;
  fill?: string;
  onClick?: (e: MouseEvent<SVGElement>) => void;
};

function CloseIcon({
  height = '32',
  width = '32',
  fill = theme.colors.black.primary,
  ...props
}: Props) {
  return (
    <svg
      fill={fill}
      height={height}
      viewBox="0 0 32 32"
      width={width}
      {...props}
    >
      <path d="M27.625 5.969l-1.781-1.75-9.813 9.844-9.813-9.844-1.813 1.75 9.813 9.813-9.844 9.844 1.781 1.781 9.813-9.844 9.813 9.844 1.781-1.781-9.813-9.781z" />
    </svg>
  );
}

export default CloseIcon;
