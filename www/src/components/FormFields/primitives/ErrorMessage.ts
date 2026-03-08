import styled from '@emotion/styled';

const ErrorMessageStyles = styled('p')(({ theme }) => ({
  '&:before': {
    borderBottom: `0.7rem solid ${theme.colors.gray.dark}`,
    borderLeft: '0.7rem solid transparent',
    borderRight: '0.7rem solid transparent',
    content: `''`,
    height: 0,
    left: '10%',
    position: 'absolute',
    top: '-0.6rem',
    width: 0,
  },
  background: theme.colors.gray.dark,
  borderRadius: '0.4rem',
  color: theme.colors.white.primary,
  display: 'block',
  fontSize: '1.3rem',
  fontWeight: 'bold',
  left: theme.dimensions.gutter,
  padding: '0.5rem 1rem',
  position: 'absolute',
  top: '-1rem',
  zIndex: 1,
}));

export default ErrorMessageStyles;
