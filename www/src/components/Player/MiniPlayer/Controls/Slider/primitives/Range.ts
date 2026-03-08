import styled from '@emotion/styled';

const Range = styled('input')({
  '&[disabled]': {
    cursor: 'default',
    pointerEvents: 'none',
  },

  border: 'none',
  cursor: 'pointer',
  display: 'block',
  height: '100%',
  margin: 0,
  opacity: 0,
  padding: 0,
  width: '100%',
});

export default Range;
