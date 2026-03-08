import mediaQueryBuilder from 'styles/helpers/mediaQueryBuilder';
import SelectBox from 'web-ui/templates/FormElements/SelectBox';
import styled from '@emotion/styled';

const CategorySelect = styled(SelectBox)(({ theme }) => ({
  float: 'right',
  width: '33.33%',

  [mediaQueryBuilder(theme.mediaQueries.max.width['768'])]: {
    float: 'none',
    marginBottom: '1rem !important',
    width: '100% !important',
  },
}));

export default CategorySelect;
