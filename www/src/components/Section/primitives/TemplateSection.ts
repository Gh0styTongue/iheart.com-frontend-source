import mediaQueryBuilder from 'styles/helpers/mediaQueryBuilder';
import styled from '@emotion/styled';

type Props = {
  fullWidth?: boolean;
  hasBorder?: boolean;
  hasExtraPadding?: boolean;
  hasMobileBottomLink?: boolean;
  suppressFirstOfType?: boolean;
};

const TemplateSection = styled('section')<Props>(
  ({
    fullWidth = false,
    hasBorder = true,
    hasExtraPadding = true,
    hasMobileBottomLink = false,
    suppressFirstOfType,
    theme,
  }) => ({
    borderTop: hasBorder ? `1px solid ${theme.colors.gray['300']}` : 'none',
    padding: hasExtraPadding ? '3rem 0' : '1.5rem 0',
    position: 'relative',
    width: fullWidth ? '100%' : 'initial',
    ':first-of-type':
      suppressFirstOfType ?
        {}
      : {
          borderTopWidth: '0',
          paddingTop: '0',
        },
    table: {
      tableLayout: 'fixed',
      width: '100%',
    },
    [mediaQueryBuilder(theme.mediaQueries.max.width['599'])]: {
      paddingBottom: hasMobileBottomLink ? '6rem' : '1rem',
    },
  }),
);

export default TemplateSection;
