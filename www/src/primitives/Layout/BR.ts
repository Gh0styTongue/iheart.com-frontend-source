import styled from '@emotion/styled';
import type { Dimensions } from 'styles/dimensions';

type Props = {
  dimension?: (value: Dimensions) => string;
};

const BR = styled('br')<Props>(({ dimension, theme }) => ({
  margin: dimension && `${dimension(theme.dimensions)} auto`,
}));

export default BR;
