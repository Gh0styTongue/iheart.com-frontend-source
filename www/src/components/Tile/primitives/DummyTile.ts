import styled from '@emotion/styled';

type Props = {
  isRoundImage?: boolean;
};

const DummyTile = styled('div')<Props>(({ isRoundImage = false, theme }) => ({
  backgroundColor: theme.colors.gray['300'],
  borderRadius: isRoundImage ? '50%' : '0.8rem',
  paddingTop: '93%',
  width: '100%',
}));

export default DummyTile;
