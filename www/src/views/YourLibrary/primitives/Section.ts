import mediaQueryBuilder from 'styles/helpers/mediaQueryBuilder';
import styled from '@emotion/styled';

type Props = {
  fullMobileHeight?: boolean;
  hasAd?: boolean;
};

const Section = styled('div')<Props>(
  ({ fullMobileHeight = true, hasAd = true, theme }) => ({
    height: '100%',
    padding: '0 0 0 7rem',
    width: '100%',

    [mediaQueryBuilder(theme.mediaQueries.max.width['599'])]: {
      height: fullMobileHeight ? '100%' : 'auto',
      padding: '3rem 1.6rem',
    },

    ...(hasAd ?
      {
        [mediaQueryBuilder(theme.mediaQueries.max.width['599'])]: {
          height: fullMobileHeight ? '100%' : 'auto',
          marginLeft: 0,
          padding: '3rem 1.6rem',
        },
      }
    : {}),
  }),
);

export default Section;
