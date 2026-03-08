import mediaQueryBuilder from 'styles/helpers/mediaQueryBuilder';
import MediaServerImage from 'components/MediaServerImage';
import styled from '@emotion/styled';

type Props = { newHero?: boolean; whiteBackground?: boolean };

const HeroThumbnail = styled(MediaServerImage)<Props>(
  ({ newHero = false, theme, whiteBackground }) => ({
    background: whiteBackground ? theme.colors.white.primary : 'auto',
    borderRadius: whiteBackground ? '.5rem' : 0,
    height: '19.5rem',
    transition: 'opacity 0.5s 0.1s ease-in-out',
    width: '19.5rem',

    ...(!newHero ?
      {
        [mediaQueryBuilder(theme.mediaQueries.max.width['768'])]: {
          height: '10rem',
          width: '10rem',
        },
      }
    : {}),

    ...(newHero ?
      {
        [mediaQueryBuilder(theme.mediaQueries.max.width['1024'])]: {
          height: '17.2rem',
          width: '17.2rem',
        },
        [mediaQueryBuilder(theme.mediaQueries.max.width['599'])]: {
          height: '10rem',
          width: '10rem',
        },
      }
    : {}),
  }),
);

export default HeroThumbnail;
