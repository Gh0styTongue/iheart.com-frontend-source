import mediaQueryBuilder from 'styles/helpers/mediaQueryBuilder';
import styled from '@emotion/styled';

type Props = { hasIcon: boolean; sticky?: boolean };

const GrowlTitle = styled.h3<Props>(({ hasIcon, sticky, theme }) => ({
  color: theme.colors.white.primary,
  fontSize: theme.fonts.size['18'],
  lineHeight: theme.fonts.lineHeight['26'],
  minHeight: '2.5rem',
  marginLeft: hasIcon ? '1rem' : '1.5rem',
  display: 'inline-block',
  verticalAlign: 'top',
  // to get wrapping right we need the text to leave room for the close icon (sticky = true)
  width: `calc(${['100%', '1.5rem', hasIcon && '2.5rem', sticky && '4.4rem']
    .filter(Boolean)
    .join(' - ')})`,
  [mediaQueryBuilder(theme.mediaQueries.max.width['768'])]:
    sticky ?
      {}
    : {
        textAlign: 'center',
      },
  a: {
    color: theme.colors.white.primary,
  },
}));

export default GrowlTitle;
