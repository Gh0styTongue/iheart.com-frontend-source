import styled from '@emotion/styled';

type Props = {
  small: boolean;
};

const Wrapper = styled('section')<Props>(({ small, theme }) => ({
  marginTop: small ? '1rem' : 0,
  paddingBottom: `calc(${theme.dimensions.gutter} * 2)`,
}));

export default Wrapper;
