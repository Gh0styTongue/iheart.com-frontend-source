import invariant from 'invariant';
import useZindex from 'contexts/zIndexContext/useZindex';
import { ANCHOR } from './constants';
import { createPortal } from 'react-dom';
import { noop, throttle } from 'lodash-es';
import {
  ReactNode,
  RefObject,
  SyntheticEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import { TooltipContent } from './primitives';
import type { TooltipContent as ToolTipContent } from './primitives/TooltipContent';

type Props = {
  /**
   * 'children' prop must be a function that returns a component. The ref needs to be placed on the
   * element that will serve as the expanded content.
   */
  children: (a: {
    ref: RefObject<HTMLDivElement>;
    toggle: () => void;
  }) => ReactNode;
  Container: ToolTipContent;
  /* This callback is called every time the tooltip closes. */
  onClose?: () => void;
  /* This callback is called every time the tooltip opens. */
  onOpen?: () => void;
  /**
   * 'target' prop must be a function that returns a component. The ref needs to be placed on the
   * * element that will serve as the hit target.
   */
  target: (target: {
    ref: RefObject<HTMLButtonElement>;
    toggle: () => void;
  }) => ReactNode;
  /* if false, scrolls with page, if true keeps position regardless of scroll */
  fixed?: boolean;
};

function Tooltip({
  children,
  Container = TooltipContent,
  onClose = noop,
  onOpen = noop,
  target,
  fixed = false,
}: Props) {
  if (__DEV__) {
    invariant(
      typeof target === 'function',
      `'target' prop must be a function that returns a component.`,
    );

    invariant(
      typeof children === 'function',
      `'children' prop must be a function that returns a component.`,
    );
  }

  const zIndex = useZindex() ?? 1;

  /* State to determine whether or not we should open the tooltip. */
  const [open, setOpen] = useState<boolean>(false);

  /**
   * We set the initial state of the anchor to open at the origin and be anchored to the bottom
   * center of the content, which means that the toolip will be centered above the hit target.
   */
  const [anchor, setAnchor] = useState<{
    x: string;
    y: string;
  }>({
    x: ANCHOR.X.CENTER,
    y: ANCHOR.Y.BOTTOM,
  });

  /* This is needed to determine the x,y coordinates of the hit target. */
  const targetRef = useRef<HTMLButtonElement | null>(null);

  /* This is needed to determine the the height/width of the content. */
  const contentRef = useRef<HTMLDivElement | null>(null);

  /**
   * The origin corresponds to the exact center of the hit target. The origin is the reference
   * point at which the content is anchored.
   */
  // We want this to recalculate on every render.
  let origin: { x?: number; y?: number } = {};
  if (targetRef.current) {
    const targetRect = targetRef.current.getBoundingClientRect();
    const x = window.pageXOffset + targetRect.left + targetRect.width / 2;
    const y = window.pageYOffset + targetRect.top + targetRect.height / 2;
    origin = { x, y };
  }

  const toggle = useCallback(() => {
    setOpen(!open);
  }, [open]);

  const preventDefault = useCallback<
    (e: SyntheticEvent<HTMLDivElement>) => void
  >(e => e.preventDefault(), []);

  /* onResize is only added on resize when tooltip is open. Will close the tooltip */
  const onResize = throttle(() => {
    if (!__CLIENT__) return;
    setOpen(false);
  }, 300);

  const onScroll = throttle(() => {
    if (!contentRef.current) return;

    if (fixed && contentRef.current.style.position !== 'fixed') {
      contentRef.current.style.position = 'fixed';
    }
  }, 100);

  /**
   * This piece of logic is useful for determining where the content should be anchored. Example: if
   * the content overflows outside of the window to the right and bottom, the anchor will adjust
   * accordingly.
   */
  useEffect(() => {
    function getAnchor() {
      const returnObj = {
        update: false,
        val: {
          x: '',
          y: '',
        },
      };

      if (!open || contentRef.current === null || targetRef.current === null)
        return returnObj;

      const contentRect = contentRef.current.getBoundingClientRect();
      const bottomDelta =
        window.pageYOffset + contentRect.bottom - window.innerHeight;
      const leftDelta = window.pageXOffset + contentRect.left;
      const rightDelta =
        window.pageXOffset + contentRect.right - window.innerWidth;
      const topDelta = window.pageYOffset + contentRect.top;

      const updatedAnchor = { ...anchor };

      if (bottomDelta > 0) updatedAnchor.y = ANCHOR.Y.BOTTOM;
      if (leftDelta < 0) updatedAnchor.x = ANCHOR.X.LEFT;
      if (rightDelta > 0) updatedAnchor.x = ANCHOR.X.RIGHT;
      if (topDelta < 0) updatedAnchor.y = ANCHOR.Y.TOP;

      if (anchor.x === updatedAnchor.x && anchor.y === updatedAnchor.y)
        return returnObj;

      return {
        update: true,
        val: updatedAnchor,
      };
    }
    const { update, val } = getAnchor();

    if (update) setAnchor(val);
  }, [anchor, open]);

  /* We call these effect callbacks as a result of the open state changing. */
  useEffect(
    () => {
      if (open) {
        /* When we open the tooltip, we want to give focus to the content. Defer this focus function to ensure it executed after react updated */
        if (contentRef.current !== null) {
          setTimeout(() => contentRef?.current?.focus(), 0);
        }

        /**
         * This is specifically for iOS devices. We can only blur and focus under two conditions:
         *   1. We are clicking a button or anchor tab.
         *   2. The thing we are clicking has the CSS cursor property set to something besides
         *      default.
         */
        if (document.body !== null) document.body.style.cursor = 'pointer';
        if (typeof onOpen === 'function') onOpen();
        window.addEventListener('resize', onResize);
        window.addEventListener('scroll', onScroll);
      } else {
        if (document.body !== null) document.body.style.cursor = 'default';
        if (typeof onClose === 'function') onClose();
        window.removeEventListener('resize', onResize);
        window.removeEventListener('scroll', onScroll);
      }
    } /* We only want these effects to run if the open state changes. */,
    [open],
  );

  return (
    <>
      {target({ ref: targetRef, toggle })}
      {__CLIENT__ &&
        open &&
        createPortal(
          <Container
            data-anchor-x={anchor.x}
            data-anchor-y={anchor.y}
            data-origin-x={origin.x}
            data-origin-y={origin.y}
            data-test="tooltip-content"
            onMouseDown={preventDefault}
            zIndex={zIndex}
          >
            {children({ ref: contentRef, toggle })}
          </Container>,
          window.document.querySelector('body') as HTMLBodyElement,
        )}
    </>
  );
}

export default Tooltip;
