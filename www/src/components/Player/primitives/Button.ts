import isTouch from 'utils/isTouch';
import styled from '@emotion/styled';

const Button = styled('button')(({ theme }) => {
  const selector = isTouch ? 'active' : 'hover';

  return {
    '&:focus': { outline: 0 },
    [`&:${selector}`]: { opacity: 0.75 },

    '&[disabled]': {
      [`&:${selector}`]: { opacity: 0.5 },
      cursor: 'default',
      opacity: 0.5,
    },

    backgroundColor: theme.colors.transparent.primary,
    border: 'none',
    cursor: 'pointer',
    display: 'inline-block',
    lineHeight: 0,
    margin: 0,
    maxHeight: '100%',
    opacity: 1,
    padding: 0,
    position: 'relative',
  };
});

Button.defaultProps = { role: 'button' };

export default Button;
