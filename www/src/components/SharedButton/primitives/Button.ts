import Children from './Children';
import styled from '@emotion/styled';

type Props = {
  isBlock?: boolean;
  size?: 'regular' | 'small';
};

const Button = styled('button')<Props>(
  ({ isBlock = false, size = 'regular', theme }) => ({
    alignItems: 'center',
    backgroundPosition: 'center',
    borderRadius: '99.9rem',
    cursor: 'pointer',
    fontSize: theme.fonts.size['16'],
    fontWeight: theme.fonts.weight.medium,
    height: '100%',
    justifyContent: 'center',
    lineHeight: theme.fonts.lineHeight['18'],
    minHeight: '4.4rem',
    outline: 'none',
    paddingLeft: '2.5rem',
    paddingRight: '2.5rem',
    position: 'relative',

    '&:disabled': {
      cursor: 'default',

      [Children.toString()]: {
        cursor: 'default',
      },
    },

    // block button styling
    ...(size === 'small' ?
      {
        fontSize: theme.fonts.size['14'],
        lineHeight: theme.fonts.lineHeight['16'],
        minHeight: '2.7rem',
        paddingLeft: '2rem',
        paddingRight: '2rem',

        ...(isBlock ?
          {
            paddingLeft: '3.3rem',
            paddingRight: '3.3rem',
          }
        : {}),
      }
    : {}),
  }),
);

export default Button;
