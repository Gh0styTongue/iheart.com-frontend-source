import styled from '@emotion/styled';

const Rows = styled('div')(({ theme }) => ({
  borderTop: `1px solid ${theme.colors.gray['300']}`,
  height: 'calc(100% - 5rem)',
  marginTop: '1.6rem',
  paddingTop: '1.6rem',
}));

export default Rows;
