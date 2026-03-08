import Dropdown from 'components/Dropdown';
import mediaQueryBuilder from 'styles/helpers/mediaQueryBuilder';
import styled from '@emotion/styled';

const ShareDropdown = styled(Dropdown)(({ theme }) => ({
  display: 'block',
  marginLeft: '2rem',

  [mediaQueryBuilder(theme.mediaQueries.max.width['768'])]: {
    display:
      'none !important' /* needed to overrite the PostCSS in Dropdown.css (.root) */,
  },

  ul: {
    li: {
      a: {
        display: 'block',
        fontWeight: 400,
        padding: '1.5rem 1rem',
      },

      margin: '1rem',
    },

    padding: 0,
  },
}));

export default ShareDropdown;
