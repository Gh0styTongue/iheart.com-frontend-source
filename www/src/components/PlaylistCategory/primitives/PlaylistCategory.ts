import styled from '@emotion/styled';

type Props = {
  showBorder?: boolean;
};

const PlaylistCategory = styled('div')<Props>(({ showBorder = true }) => {
  return {
    borderBottom: showBorder ? 'solid 0.1rem rgba(119, 119, 119, 0.5)' : 'none',
    marginTop: '2.5rem',
    paddingBottom: '2.5rem',

    '&:first-of-type': {
      marginTop: 0,
    },

    '&:last-child': {
      paddingBottom: 0,
      borderWidth: 0,
    },
  };
});

export default PlaylistCategory;
