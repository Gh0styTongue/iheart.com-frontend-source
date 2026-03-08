import styled from '@emotion/styled';

const InputSelect = styled('div')(({ theme }) => ({
  backgroundColor: theme.colors.white.primary,
  border: `1px solid ${theme.colors.gray['300']}`,
  fontSize: theme.fonts.size.small,
  height: '3.7rem',
  lineHeight: 'normal',
  outline: 'none',
  padding: '0 1rem',
  borderRadius: '0.5rem',
  display: 'block',
  position: 'relative',
  verticalAlign: 'top',

  'p.default': {
    color: theme.colors.gray['400'],
  },

  '&:hover': {
    border: `1px solid darken(${theme.colors.gray['300']}, 10)`,
  },

  select: {
    appearance: 'none',
    cursor: 'pointer',
    height: '100%',
    left: '0',
    opacity: '0',
    position: 'absolute',
    top: '0',
    width: '100%',
    zIndex: 1,
  },

  '&.short': {
    height: '3.2rem',
    lineHeight: 'calc(3.2rem - 4px)',
  },
}));

export default InputSelect;
