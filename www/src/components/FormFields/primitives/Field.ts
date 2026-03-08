import LabelWrapper from './Label';
import styled from '@emotion/styled';

type Props = {
  contentIsInvalid: boolean;
};

const labelHeight = '1.8rem';
const Field = styled('input')<Props>(({ contentIsInvalid, theme }) => ({
  color: contentIsInvalid ? theme.colors.red.primary : theme.colors.gray.medium,
  [`&:focus ~ ${LabelWrapper}`]: {
    '&.placeholderVisible': {
      color: theme.colors.gray.medium,
    },
    color: theme.colors.gray.dark,
  },
  '&.placeholderVisible': {
    height: `calc(100 % -${labelHeight})`,
  },
  '&::-ms-clear': {
    display: 'none',
    width: 0,
    height: 0,
  },
}));

export default Field;
