import styled from '@emotion/styled';

const Separator = styled('span')(({ theme }) => ({
  borderBottom: `0.1rem solid ${theme.colors.gray['300']}`,
  display: 'inherit',
}));

export default Separator;
