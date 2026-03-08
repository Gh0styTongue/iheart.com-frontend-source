import mediaQueryBuilder from 'styles/helpers/mediaQueryBuilder';
import styled from '@emotion/styled';

type Props = {
  leftAligned?: boolean;
  isSmall?: boolean;
};

const ThumbnailWrapper = styled.div<Props>(
  ({ leftAligned = false, isSmall = false, theme }) => ({
    alignItems: 'flex-end',
    alignSelf: 'center',
    display: 'flex',
    flexDirection: 'column',
    padding: '0 3rem',
    width: leftAligned ? 'auto' : '50%',

    [mediaQueryBuilder(theme.mediaQueries.max.width['768'])]: {
      padding: leftAligned ? '0 1rem' : '0 1.5rem',
    },

    [mediaQueryBuilder(theme.mediaQueries.max.width['370'])]: {
      padding: leftAligned ? '0 0.5rem' : '0 1.5rem',
      width: leftAligned ? 'auto' : '45%',
    },

    ...(isSmall ?
      {
        img: {
          display: 'none',

          [mediaQueryBuilder(theme.mediaQueries.max.width['768'])]: {
            display: 'block',
          },
        },
      }
    : {}),
  }),
);

export default ThumbnailWrapper;
