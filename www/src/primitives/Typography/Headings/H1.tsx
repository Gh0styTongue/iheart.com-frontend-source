import styled from '@emotion/styled';
import { omit } from 'lodash-es';
import { ReactElement } from 'react';
import type { Colors } from 'styles/colors';

type Props = {
  as?: string;
  color?: (color: Colors) => string;
};

const Sanitized = ({ as = 'h1', ...props }: Props): ReactElement =>
  React.createElement(as, omit(props, ['color']));

const H1 = styled(Sanitized)(({ color, theme }) => ({
  color:
    typeof color === 'function' ?
      color(theme.colors)
    : theme.colors.gray['600'],
  fontSize: theme.fonts.size['40'],
  fontWeight: theme.fonts.weight.bold,
  letterSpacing: '-0.1rem',
  lineHeight: theme.fonts.lineHeight['46'],
  marginBottom: '1rem',
  transition: 'all 300ms ease-in-out',
}));

export default H1;
