import Background from 'components/SharedButton/primitives/Background';
import rgba from 'styles/helpers/colors/rgbaBuilder';
import SharedButton from 'components/SharedButton';
import styled from '@emotion/styled';
import { merge } from 'lodash-es';
import { SyntheticEvent } from 'react';

type Props = {
  center?: boolean;
  customStyles?: {
    backgroundColorDisabled?: string;
    borderColor?: string;
    hoverColor?: string;
    textColor?: string;
    textColorDisabled?: string;
  };
  floatRight?: boolean;
  isBlock?: boolean;
  marginLeft?: string;
  marginRight?: string;
  marginTop?: string;
  onClick?: (ev: SyntheticEvent<HTMLButtonElement>) => void;
  styleType?: 'dark' | 'light';
  type?: string;
  tabIndex?: number;
};

const OutlinedButton = styled(SharedButton)<Props>(({
  center = false,
  customStyles = {},
  floatRight = false,
  marginLeft = '0',
  marginRight = '0',
  marginTop = '0',
  isBlock = false,
  styleType = 'dark',
  theme,
}) => {
  const STYLE_TYPES = {
    dark: {
      backgroundColorDisabled: theme.colors.gray['200'],
      borderColor: theme.colors.gray['500'],
      hoverColor: theme.colors.black.dark,
      hoverOpacity: 0.15,
      textColor: theme.colors.gray['500'],
      textColorDisabled: theme.colors.gray['500'],
    },
    light: {
      backgroundColorDisabled: theme.colors.gray['300'],
      borderColor: theme.colors.white.primary,
      hoverColor: theme.colors.white.primary,
      hoverOpacity: 0.3,
      textColor: theme.colors.white.primary,
      textColorDisabled: theme.colors.gray['500'],
    },
  };
  const themeVariables = merge({}, STYLE_TYPES[styleType], customStyles);
  const hoverColor = rgba(
    themeVariables.hoverColor!,
    themeVariables.hoverOpacity,
  );

  return {
    backgroundColor: theme.colors.transparent.primary,
    border: `1px solid ${themeVariables.borderColor}`,
    float: floatRight ? 'right' : 'none',
    margin: center ? 'auto' : 0,
    marginLeft,
    marginRight,
    marginTop,
    color: themeVariables.textColor,
    width: isBlock ? '100%' : 'auto',
    // IHRWEB-15651 icon added in outline button
    'i, svg': { marginRight: '0.5rem' },
    '&:not(:disabled):hover': {
      [Background.toString()]: {
        backgroundImage: `radial-gradient(circle, ${theme.colors.transparent.primary} 1%, ${hoverColor} 1%)`,
        backgroundColor: hoverColor,
        backgroundPosition: 'center',
        backgroundSize: '15000%',
      },
    },

    '&:not(:disabled):active': {
      [Background.toString()]: {
        backgroundColor: 'transparent',
        backgroundSize: '100%',
        transition: 'background 0s',
      },
    },

    '&:disabled': {
      backgroundColor: themeVariables.backgroundColorDisabled,
      border: 'none',
      color: themeVariables.textColorDisabled,
    },
  };
});

export default OutlinedButton;
