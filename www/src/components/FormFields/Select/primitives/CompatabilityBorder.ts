import styled from '@emotion/styled';

type Props = {
  active: boolean;
};

const CompatabilityBorder = styled('span')<Props>(({ active, theme }) => ({
  backgroundColor: theme.colors.white.primary,
  border:
    active ?
      `1px solid ${theme.colors.blueNew['500']}`
    : `1px solid ${theme.colors.gray.light}`,
  borderRadius: '0.5rem',
  bottom: '0',
  height: '3.7rem',
  left: '-0.1rem',
  pointerEvents: 'none',
  position: 'absolute',
  right: '-0.1rem',
  width: 'calc(100% - 2px)',
}));

export default CompatabilityBorder;
