import styled from '@emotion/styled';

type Props = {
  horizontal?: boolean;
};

const RailItems = styled('span')<Props>(({ horizontal = false }) => ({
  alignItems: 'flex-start',
  display: 'flex',
  flexDirection: 'column',
  flexWrap: 'wrap',
  justifyContent: 'center',
  paddingTop: '2rem',

  ...(horizontal ?
    {
      alignItems: 'center',
      flexDirection: 'row',
      justifyContent: 'flex-start',
      paddingTop: '0.8rem',
    }
  : {}),
}));

export default RailItems;
