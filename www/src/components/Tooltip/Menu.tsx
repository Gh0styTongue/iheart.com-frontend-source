import Tooltip from './Tooltip';
import { ComponentType, ReactNode, RefObject, useCallback } from 'react';
import { Dots } from 'styles/icons';
import {
  MenuContent,
  MenuItem,
  MenuList,
  TargetButton,
  TooltipContentValue,
} from './primitives';
import type { TooltipContent as ToolTipContent } from 'components/Tooltip/primitives/TooltipContent';

type Props = {
  children: ReactNode;
  target?: ReactNode;
  container?: ToolTipContent;
  fixed?: boolean;
};

type Callback<Element> = (args: {
  ref: RefObject<Element>;
  toggle: () => void;
}) => ReactNode;

function Menu({ children, container, fixed, target = <Dots /> }: Props) {
  const defaultTarget = useCallback<Callback<HTMLButtonElement>>(
    ({ ref, toggle }) => (
      <TargetButton
        aria-label="More"
        data-test="target-button"
        onMouseDown={toggle}
        ref={ref}
        role="button"
      >
        {target}
      </TargetButton>
    ),
    [target],
  );

  const content = useCallback<Callback<HTMLDivElement>>(
    ({ ref, toggle }) => (
      <MenuContent
        aria-label="Menu Content"
        data-test="menu-content"
        onBlur={toggle}
        onClick={toggle}
        ref={ref}
        tabIndex={0}
      >
        {children}
      </MenuContent>
    ),
    [children],
  );

  return (
    <Tooltip
      Container={container ?? TooltipContentValue}
      fixed={fixed}
      target={defaultTarget}
    >
      {content}
    </Tooltip>
  );
}

Menu.Item = MenuItem;
Menu.List = MenuList;

export default Menu as ComponentType<Props> & {
  Item: typeof MenuItem;
  List: typeof MenuList;
};
