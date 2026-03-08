import Button from './primitives/Button';
import Link from './primitives/Link';
import Menu from 'components/Tooltip/Menu';
import OverflowIcon from 'styles/icons/player/Controls/Overflow/OverflowIcon';
import { Children } from 'react';
import type { ReactNode } from 'react';
import type { TooltipContent } from 'components/Tooltip/primitives/TooltipContent';

type Props = {
  children: ReactNode;
  container?: TooltipContent;
  target?: ReactNode;
};

function Overflow({ children, container, target = <OverflowIcon /> }: Props) {
  return (
    <Menu container={container} fixed target={target}>
      <Menu.List>
        {Children.map(
          children,
          child =>
            child && <Menu.Item data-test="overflow-item">{child}</Menu.Item>,
        )}
      </Menu.List>
    </Menu>
  );
}

Overflow.Button = Button;
Overflow.Link = Link;

export default Overflow;
