import mediaQueryBuilder from 'styles/helpers/mediaQueryBuilder';
import styled from '@emotion/styled';

type Props = {
  shouldShow?: boolean;
};

const Title = styled('span')<Props>(({ shouldShow = false, theme }) => ({
  display: 'flex',

  [mediaQueryBuilder(theme.mediaQueries.max.width['599'])]: {
    display: shouldShow ? 'flex' : 'none',
  },
}));

export default Title;
