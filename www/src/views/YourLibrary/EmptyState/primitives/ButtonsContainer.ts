import styled from '@emotion/styled';

const ButtonsContainer = styled('div')({
  '> :not(:first-of-type), >:not(:last-child)': {
    marginBottom: '2.4rem',
  },

  alignItems: 'center',
  display: 'flex',
  flexDirection: 'column',
  justifyButtonsContainer: 'center,',
  marginTop: '2.4rem',
  width: '100%',
});

export default ButtonsContainer;
