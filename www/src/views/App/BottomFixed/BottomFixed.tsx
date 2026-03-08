import styled from '@emotion/styled';

export type ConnectedProps = {
  appMounted: boolean;
  modalOpen: boolean;
  isSearchOpen: boolean;
};

export type OwnProps = {
  reorderActive?: boolean;
};

type Props = ConnectedProps & OwnProps;

const BottomFixed = styled('div')<Props>(({
  modalOpen,
  isSearchOpen,
  appMounted,
  reorderActive,
  theme,
}) => {
  const hidden = !appMounted || reorderActive;

  return {
    bottom: hidden ? '-100%' : 0,
    position: 'fixed',
    width: '100%',
    zIndex:
      modalOpen && !isSearchOpen ?
        theme.zIndex.bottomFixedwModal
      : theme.zIndex.bottomFixed,
  };
});

export default BottomFixed;
