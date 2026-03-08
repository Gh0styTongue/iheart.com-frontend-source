import styled from '@emotion/styled';

const Title = styled('div')(({ theme }) => ({
  ...theme.mixins.ellipsis,
}));

export default Title;
