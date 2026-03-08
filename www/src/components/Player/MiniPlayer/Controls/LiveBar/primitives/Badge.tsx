import styled from '@emotion/styled';

const Badge = styled('div')(({ theme }) => ({
  backgroundColor: theme.colors.red[500],
  color: theme.colors.white.primary,
  display: 'inline-block',
  fontWeight: theme.fonts.weight.bold,
  fontSize: theme.fonts.size.tiny,
  height: 'auto',
  left: 'calc(50% - 2rem)',
  padding: '.25rem',
  position: 'absolute',
  textTransform: 'uppercase',
  top: 0,
  width: '4rem',
}));

export default Badge;
