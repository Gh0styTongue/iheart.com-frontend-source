import mediaQueryBuilder from 'styles/helpers/mediaQueryBuilder';
import styled from '@emotion/styled';

type Props = {
  last?: boolean;
};

const InputField = styled('input')<Props>(({ last, theme }) => ({
  '&.error': {
    border: `1px solid ${theme.colors.red.primary}`,
  },
  display: 'flex',
  flex: 1,
  margin: '0',
  [mediaQueryBuilder(theme.mediaQueries.max.width['768'])]: {
    width: '100%',
  },
  width: last ? '100%' : 'auto',
  fontFamily: 'inherit',
}));

export default InputField;
