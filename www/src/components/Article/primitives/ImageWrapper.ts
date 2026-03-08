import Hover from 'shared/ui/components/primitives/Hover';
import styled from '@emotion/styled';

const ImageWrapper = styled('div')({
  display: 'inline-block',
  position: 'relative',
  verticalAlign: 'middle',
  width: '6rem',
  '&:hover': {
    [Hover.toString()]: {
      display: 'block',
    },
  },
});

export default ImageWrapper;
