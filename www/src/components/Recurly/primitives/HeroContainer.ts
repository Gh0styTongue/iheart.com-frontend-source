import mediaQueryBuilder from 'styles/helpers/mediaQueryBuilder';
import styled from '@emotion/styled';

type Props = {
  transformValue?: string;
};

const HeroContainer = styled('div')<Props>(({ theme, transformValue }) => ({
  alignItems: 'center',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  left: 0,
  marginTop: transformValue || '-20.2rem',
  padding: '0 1.5rem',
  position: 'absolute',
  width: '100%',

  [mediaQueryBuilder(theme.mediaQueries.max.width['768'])]: {
    transform: 'translateY(19.5rem)',
  },
}));

export default HeroContainer;
