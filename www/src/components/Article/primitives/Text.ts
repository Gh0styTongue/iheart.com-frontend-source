import mediaQueryBuilder from 'styles/helpers/mediaQueryBuilder';
import styled from '@emotion/styled';

type Props = {
  hasDropdown: boolean;
  hidePadding: boolean;
};

const Text = styled('div')<Props>(({ hasDropdown, hidePadding, theme }) => ({
  display: 'inline-block',
  padding: hidePadding ? '0 .75rem 0 1.5rem' : '0.75rem 1.5rem',
  verticalAlign: 'middle',
  width: hasDropdown ? 'calc(100% - 10rem)' : 'calc(100% - 6rem)',
  [mediaQueryBuilder(theme.mediaQueries.max.width['768'])]: {
    marginBottom: ' 1.5rem',
  },
}));

export default Text;
