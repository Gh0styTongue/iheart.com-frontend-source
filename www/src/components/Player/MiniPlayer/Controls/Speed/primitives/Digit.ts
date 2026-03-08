import styled from '@emotion/styled';

type Props = {
  color: string;
};

const Digit = styled('span')<Props>(({ color, theme }) => ({
  color,
  display: 'inline-block',
  fontSize: theme.fonts.size[16],
  fontWeight: theme.fonts.weight.bold,
  height: '3.5rem',
  lineHeight: '3.5rem',
  width: '3.5rem',
}));

export default Digit;
