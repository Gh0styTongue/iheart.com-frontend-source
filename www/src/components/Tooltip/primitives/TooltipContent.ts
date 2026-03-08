import styled from '@emotion/styled';
import theme from 'styles/themes/default';

type Props = {
  'data-origin-x'?: string | number;
  'data-origin-y'?: string | number;
  zIndex: number;
};

const TooltipContent = styled('div')<Props>(props => {
  const zIndexVal = props.zIndex ?? theme.zIndex.header;
  return {
    display: 'inline-block',
    left: props['data-origin-x'],
    pointerEvents: 'none',
    position: 'absolute',
    top: props['data-origin-y'],
    zIndex: zIndexVal + 1,
  };
});

export type TooltipContent = typeof TooltipContent;

export default TooltipContent;
