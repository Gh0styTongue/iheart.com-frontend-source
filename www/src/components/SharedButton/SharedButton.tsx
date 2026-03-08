import Background from './primitives/Background';
import Button from './primitives/Button';
import Children from './primitives/Children';
import { ReactNode, SyntheticEvent } from 'react';

type Props = {
  children: ReactNode;
  className?: string;
  disabled?: boolean;
  isBlock?: boolean;
  onClick?: (ev: SyntheticEvent<HTMLButtonElement>) => void;
  size?: 'regular' | 'small';
};

function SharedButton({
  children,
  className = '',
  disabled = false,
  isBlock = false,
  size = 'regular',
  ...props
}: Props) {
  return (
    <Button
      className={className}
      data-test="shared-button"
      disabled={disabled}
      isBlock={isBlock}
      size={size}
      {...props}
    >
      <Background />
      <Children data-test="shared-button-children">{children}</Children>
    </Button>
  );
}

export default SharedButton;
