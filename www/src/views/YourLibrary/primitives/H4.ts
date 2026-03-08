import H4Component from 'primitives/Typography/Headings/H4';
import mediaQueryBuilder from 'styles/helpers/mediaQueryBuilder';
import styled from '@emotion/styled';

type Props = {
  hideHeader?: boolean;
  hideInMobile?: boolean;
};

const H4 = styled(H4Component)<Props>(
  ({ hideHeader = false, hideInMobile = false, theme }) => ({
    display: hideHeader ? 'none' : 'flex',

    [mediaQueryBuilder(theme.mediaQueries.max.width['599'])]: {
      display: hideInMobile ? 'none' : 'flex',
    },
  }),
);

export default H4;
