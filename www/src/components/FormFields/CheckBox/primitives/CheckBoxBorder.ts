import styled from '@emotion/styled';

type Props = {
  active: boolean;
};

const CheckBoxBorder = styled('span')<Props>(({ active, theme }) => ({
  border:
    active ?
      `1px solid ${theme.colors.blueNew['500']}`
    : `1px solid ${theme.colors.gray.light}`,
  borderRadius: '0.5rem',
  height: '3rem',
  left: '0',
  pointerEvents: 'none',
  position: 'absolute',
  top: '0',
  transition: 'border-color 0.5s ease',
  width: '3rem',
  zIndex: 2,
}));

export default CheckBoxBorder;
