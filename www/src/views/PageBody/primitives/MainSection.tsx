/* eslint-disable react/jsx-props-no-spreading */
import mediaQueryBuilder from 'styles/helpers/mediaQueryBuilder';
import Section from 'primitives/Section';
import styled from '@emotion/styled';
import type { MainStyles } from '..';
import type { ReactElement } from 'react';

type Props = {
  mainStyles?: MainStyles;
  showTakeover?: boolean;
  type: 'left' | 'full';
};

function Sanitized({ mainStyles: _mainStyles, ...props }: Props): ReactElement {
  return <Section {...props} />;
}

const MainSection = styled(Sanitized)<Props>(({ mainStyles = {}, theme }) =>
  typeof mainStyles === 'function' ?
    mainStyles({ mediaQueryBuilder, theme })
  : mainStyles,
);

export default MainSection;
