import styled from '@emotion/styled';

type Props = {
  isVisible: boolean;
};

const AdsPlayerWrapper = styled.div<Props>(({ isVisible, theme }) => ({
  alignItems: 'center',
  background: theme.colors.transparent.dark,
  bottom: 0,
  display: 'flex',
  justifyContent: 'center',
  left: 0,
  opacity: isVisible ? 1 : 0,
  position: 'fixed',
  right: 0,
  top: 0,
  zIndex: isVisible ? 1000 : -1,
}));

export default AdsPlayerWrapper;
