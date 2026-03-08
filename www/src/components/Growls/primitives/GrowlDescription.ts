import LinkButton from 'primitives/Buttons/LinkButton';
import styled from '@emotion/styled';

const GrowlDescription = styled.p<{ hasIcon: boolean }>(
  ({ theme, hasIcon }) => ({
    color: theme.colors.gray.medium,
    marginLeft: hasIcon ? '4rem' : '1.5rem',
    [`& a,${LinkButton}`]: {
      color: theme.colors.blue.secondary,
      textDecoration: 'underline',
    },
  }),
);

export default GrowlDescription;
