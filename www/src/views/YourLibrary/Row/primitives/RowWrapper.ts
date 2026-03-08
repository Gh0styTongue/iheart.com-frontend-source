import mediaQueryBuilder from 'styles/helpers/mediaQueryBuilder';
import styled from '@emotion/styled';

const RowWrapper = styled('li')(({ theme }) => ({
  display: 'none',

  [mediaQueryBuilder(theme.mediaQueries.max.width['599'])]: {
    alignItems: 'center',
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: '0.8rem',
    paddingLeft: '0.3rem',
    width: '100%',
  },
}));

export default RowWrapper;
