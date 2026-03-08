import styled from '@emotion/styled';

type Props = {
  floatRight?: boolean;
  full?: boolean;
  title: string;
};

const ExplicitContainer = styled('span')<Props>(
  ({ floatRight = false, full = false, theme }) => ({
    background: full ? theme.colors.gray['300'] : theme.colors.gray['400'],
    borderRadius: '2px',
    color: full ? theme.colors.gray.dark : theme.colors.white.primary,
    cursor: 'default',
    display: 'inline-block',
    float: floatRight ? 'right' : 'none',
    fontSize: full ? '1rem' : '1.1rem',
    height: '1.4rem',
    letterSpacing: full ? '1px' : undefined,
    lineHeight: '1.4rem',
    margin: 0,
    marginLeft: floatRight ? '1.5rem' : undefined,
    padding: '0 .4rem',
    textTransform: 'uppercase',
  }),
);

export default ExplicitContainer;
