import mediaQueryBuilder from 'styles/helpers/mediaQueryBuilder';
import styled from '@emotion/styled';

type Props = {
  oneInstance?: boolean;
};

const CategoryTitle = styled.h3<Props>(({ theme, oneInstance = false }) => ({
  fontSize: oneInstance ? '2.4rem' : '2rem',
  fontWeight: 'bold',
  lineHeight: '3rem',
  marginBottom: '1.5rem',

  [mediaQueryBuilder(theme.mediaQueries.max.width['768'])]: {
    fontSize: oneInstance ? '1.8rem' : '1.6rem',
  },
}));

export default CategoryTitle;
