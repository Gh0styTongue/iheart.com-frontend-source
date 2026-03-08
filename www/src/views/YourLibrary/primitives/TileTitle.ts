import styled from '@emotion/styled';

const TileTitle = styled('div')({
  alignItems: 'center',
  display: 'flex',
  justifyContent: 'center',

  '> :last-child': {
    marginLeft: '0.75rem',
  },
});

export default TileTitle;
