import mediaQueryBuilder from 'styles/helpers/mediaQueryBuilder';
import styled from '@emotion/styled'; // many options are redundant with svgo, prefer svgo options
import SVGInline from 'react-svg-inline';

const IconSVG = styled(SVGInline)(({ theme }) => ({
  lineHeight: 0.5,
  svg: {
    height: '1em',
    [mediaQueryBuilder(theme.mediaQueries.max.width['320'])]: {
      height: '2rem',
    },
  },
}));

export default IconSVG;
