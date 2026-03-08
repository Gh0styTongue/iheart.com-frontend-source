import mediaQueryBuilder from 'styles/helpers/mediaQueryBuilder';
import styled from '@emotion/styled';

type Props = {
  hasWrappedContent?: boolean;
  showTakeover?: boolean;
  omitMainStyles?: boolean;
  styles?: {
    [key: string]: string | number;
  };

  type: 'top' | 'left' | 'right' | 'full';
};

const Section = styled('div')<Props>(({
  hasWrappedContent = false,
  showTakeover = true,
  omitMainStyles = false,
  styles = {},
  theme,
  type,
}) => {
  const section = {
    [mediaQueryBuilder(theme.mediaQueries.max.width['320'])]: {
      display: 'block',
    },
  };

  const main = {
    paddingRight: theme.dimensions.pageGutter,

    [mediaQueryBuilder(theme.mediaQueries.max.width['1160'])]: {
      paddingRight: theme.dimensions.gutter,
    },

    [mediaQueryBuilder(theme.mediaQueries.max.width['768'])]: {
      paddingRight: 0,
    },
  };
  return {
    // SectionTop
    ...(type === 'top' ?
      {
        '& > p': {
          marginBottom: '2rem',
        },
      }
    : {}),

    // SectionLeft
    ...(type === 'left' ?
      {
        ...section,
        display: 'inline-block',
        maxWidth: showTakeover ? theme.dimensions.mainColumnWidth : 'none',
        width: `calc(100% - ${theme.dimensions.rightColumnWidth})`,

        ...(omitMainStyles ? {} : main),

        [mediaQueryBuilder(theme.mediaQueries.max.width['768'])]: {
          paddingRight: 0,
          width: '100%',
        },

        [mediaQueryBuilder(theme.mediaQueries.max.width['320'])]: {
          display: 'inline-block',
        },
      }
    : {}),

    // SectionRight
    ...(type === 'right' ?
      {
        ...section,
        display: 'inline-block',
        verticalAlign: 'top',
        width: theme.dimensions.rightColumnWidth,

        [mediaQueryBuilder(theme.mediaQueries.max.width['768'])]: {
          width: '100%',
        },

        // AV - 4/16/18 - WEB-11314
        // this media query selects when the main content of the home page is shortest (when the smallest break point with three tiles across)
        // this is when the promo graphic and an especially large ad might overflow the height of the adjacent tiles
        ...(hasWrappedContent ?
          {
            [mediaQueryBuilder('(min-width: 1161px)')]: {
              // this calc is drawn from the fact that the tiles wrap after the twelfth one.  their width at this break point is (100vw - 30rem) / 3
              // there are four tiles so we multiply by 4
              maxHeight: 'calc(calc(100vw - 30rem) * 4 / 3)',
              overflow: 'hidden',
            },
          }
        : {}),
      }
    : {}),

    // SectionFull
    ...(type === 'full' ?
      {
        ...section,
        width: '100%',

        ...(omitMainStyles ? {} : main),
      }
    : {}),

    ...styles,
  };
});

export default Section;
