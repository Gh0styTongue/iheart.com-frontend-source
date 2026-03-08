import styled from '@emotion/styled';

type Props = {
  loading?: boolean;
};

const RecurlyWrapper = styled('div')<Props>(({ loading = false, theme }) => ({
  '&.error': {
    border: `1px solid ${theme.colors.red.primary}`,
    borderRadius: '0.5rem',
  },

  '.recurly-hosted-field': {
    backgroundColor: '#fff',
    border: '1px solid #C5CDD2',
    borderRadius: '0.5rem',
    height: '5rem',
    margin: '0',
    pointerEvents: loading ? 'none' : 'all',
  },
  float: 'left',
  width: '100%',
}));

export default RecurlyWrapper;
