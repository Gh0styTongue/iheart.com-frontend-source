import styled from '@emotion/styled';
import SVGInline from 'react-svg-inline';

const SVG = styled(SVGInline)({
  bottom: 0,
  display: 'block',
  left: '0%',
  margin: 0,
  padding: 0,
  position: 'absolute',
  right: '56%',
  top: 0,

  svg: {
    height: '100%',
    position: 'absolute',
    width: '100%',
  },
});

export default SVG;
