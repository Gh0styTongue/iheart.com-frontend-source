import styled from '@emotion/styled';

type Props = {
  placeholderVisible: boolean;
};

const Select = styled('select')<Props>(({ placeholderVisible, theme }) => ({
  '&:focus ~ labelWrapper': {
    color:
      placeholderVisible ? theme.colors.gray.medium : theme.colors.gray.dark,
  },
  cursor: 'pointer',
  height: ' 3.7rem',
  opacity: 0,
  width: '100%',
  border: '1px transparent',
}));

export default Select;
