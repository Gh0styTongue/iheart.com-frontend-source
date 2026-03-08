import mediaQueryBuilder from 'styles/helpers/mediaQueryBuilder';
import styled from '@emotion/styled';

const PaymentWrap = styled('div')(({ theme }) => ({
  background: theme.colors.white.primary,
  borderBottom: `1px solid ${theme.colors.black.dark}`,

  color: theme.colors.gray.dark,
  h2: {
    fontSize: '2rem',
    fontWeight: 'bold',
    marginBottom: '1.6rem',
    textAlign: 'center',
  },
  margin: '0 auto 1.6rem',
  paddingBottom: '1.6rem',
  width: '40rem',
  [mediaQueryBuilder(theme.mediaQueries.max.width['768'])]: {
    form: {
      width: '100%',
    },
    marginTop: '0rem',
    padding: '1.6rem',
    width: '100%',
  },
}));

export default PaymentWrap;
