import mediaQueryBuilder from 'styles/helpers/mediaQueryBuilder';
import styled from '@emotion/styled';
import { BREAKPOINTS } from 'constants/responsive';
import { connect } from 'react-redux';
import { createStructuredSelector } from 'reselect';
import { hasHero as getHasHero } from 'state/Hero/selectors';
import { State } from 'state/buildInitialState';

type Props = {
  hasHero?: boolean;
  marginValue?: string;
  showTakeover?: boolean;
  noPadding?: boolean;
};

const PageWrapper = styled('section')<Props>(({
  hasHero = false,
  marginValue,
  showTakeover,
  noPadding = false,
  theme,
}) => {
  const paddingWidth = showTakeover ? '3rem 17.5rem 0' : '3rem 3.2rem 0';
  return {
    backgroundColor: theme.colors.gray['100'],
    height: '100%;',
    margin: '0 auto',
    marginBottom: marginValue || '0',
    maxWidth: showTakeover ? '142rem' : BREAKPOINTS.X4LARGENEW,
    padding: noPadding ? '0' : paddingWidth,
    position: 'relative',

    [mediaQueryBuilder(theme.mediaQueries.max.width['1024'])]: {
      minWidth: 'initial',

      ...(!noPadding ?
        {
          paddingBottom: theme.dimensions.pageGutter,
          paddingLeft: theme.dimensions.gutter,
          paddingRight: theme.dimensions.gutter,
          paddingTop: theme.dimensions.pageGutter,
        }
      : {}),

      ...(hasHero ?
        {
          paddingBottom: theme.dimensions.gutter,
          paddingTop: theme.dimensions.gutter,
        }
      : {}),
    },
  };
});

export default connect(
  createStructuredSelector<State, { hasHero: boolean }>({
    hasHero: getHasHero,
  }),
)(PageWrapper);
