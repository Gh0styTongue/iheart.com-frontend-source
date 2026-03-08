import mediaQueryBuilder from 'styles/helpers/mediaQueryBuilder';
import styled from '@emotion/styled';

type Props = {
  full?: boolean;
};

const InputRow = styled('div')<Props>(({ full, theme }) => ({
  columnGap: '1rem',
  display: 'grid',
  gridTemplateColumns: full ? 'repeat(1, 1fr)' : 'repeat(2, 1fr)',
  [mediaQueryBuilder(theme.mediaQueries.max.width['768'])]: {
    gridTemplateColumns: 'repeat(1, 1fr)',
  },
  rowGap: '2rem',
}));

export default InputRow;
