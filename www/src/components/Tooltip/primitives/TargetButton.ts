import isTouch from 'utils/isTouch';
import styled from '@emotion/styled';

const TargetButton = styled('button')(({ theme }) => {
  const selector = isTouch ? 'active' : 'hover';

  return {
    '&:focus': { outline: 0 },
    [`&:${selector}`]: {
      opacity: 0.75,

      '[aria-label="Dots"] path': {
        fill: theme.colors.gray['600'],
      },
    },

    backgroundColor: theme.colors.transparent.primary,
    border: 'none',
    cursor: 'pointer',
    lineHeight: 0,
    padding: '1rem',
  };
});

export default TargetButton;
