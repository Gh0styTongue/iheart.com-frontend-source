import styled from '@emotion/styled';
import { omit } from 'lodash-es';
import { ReactElement } from 'react';
import type { Colors } from 'styles/colors';
import type { FontKey } from 'styles/fonts';
import type { Theme } from 'styles/themes/default';

type Props = {
  color?: (color: Colors) => string;
  fontSize?: (size: FontKey) => string;
  styles?: ((style: Theme) => Record<string, any>) | Record<string, any>;
  textAlign?: 'center' | 'left' | 'right';
};

function Sanitized(props: Props): ReactElement {
  return <p {...omit(props, ['color', 'fontSize', 'styles', 'textAlign'])} />;
}

const P = styled(Sanitized)<Props>(
  ({ color, fontSize, styles, textAlign = 'left', theme }) => ({
    color:
      typeof color === 'function' ?
        color(theme.colors)
      : theme.colors.gray['600'],
    fontSize:
      typeof fontSize === 'function' ?
        fontSize(theme.fonts.size)
      : theme.fonts.size['16'],
    textAlign,
    ...(typeof styles === 'function' ? styles(theme) : styles),
  }),
);

export default P;
