import styled from '@emotion/styled';

const Container = styled('div')(({ theme }) => ({
  backgroundColor: theme.colors.gray['100'],
  boxSizing: 'border-box',
  display: 'flex',
  flex: '0 1 auto',
  flexDirection: 'row',
  flexWrap: 'wrap',
  fontSize: theme.fonts.size.xsmall,
  lineHeight: '1.8rem',
  marginBottom: '2rem',
  marginTop: '2rem',
  marginLeft: 0,
  padding: 0,
  transform: 'translateY(-3.5rem)',
}));

export default Container;
