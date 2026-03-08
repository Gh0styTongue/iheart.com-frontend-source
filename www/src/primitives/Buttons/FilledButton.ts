import Background from 'components/SharedButton/primitives/Background';
import rgba from 'styles/helpers/colors/rgbaBuilder';
import SharedButton from 'components/SharedButton';
import styled from '@emotion/styled';
import { merge } from 'lodash-es';

export type StyleType =
  | 'cta'
  | 'cta2'
  | 'dark'
  | 'facebook'
  | 'forYouUpsell'
  | 'googlePlus'
  | 'instagram'
  | 'light'
  | 'pinterest'
  | 'snapchat'
  | 'tiktok'
  | 'tumblr'
  | 'x'
  | 'youtube';

type Props = {
  center?: boolean;
  customStyles?: {
    background?: string;
    backgroundColor?: string;
    backgroundColorDisabled?: string;
    borderColor?: string;
    hoverColor?: string;
    hoverOpacity?: number;
    minHeight?: string;
    padding?: string;
    textColor?: string;
    textColorDisabled?: string;
  };
  customSVGStyles?: {
    fill?: string;
    height?: string;
    width?: string;
  };
  display?: string;
  isBlock?: boolean;
  isSdk?: boolean;
  marginBottom?: boolean;
  marginLeft?: string;
  marginRight?: string;
  marginTop?: string;
  style?: Record<string, unknown>;
  styleType?: StyleType;
  tabIndex?: number;

  type?: string;
};

const FilledButton = styled(SharedButton)<Props>(({
  center = false,
  customStyles,
  customSVGStyles,
  display = '',
  isBlock = false,
  marginLeft = center ? 'auto' : '0',
  marginRight = center ? 'auto' : '0',
  marginTop = '0',
  marginBottom = false,
  styleType = 'dark',
  theme,
}) => {
  const STYLE_TYPES = {
    cta: {
      backgroundColor: theme.colors.blueNew['500'],
      backgroundColorDisabled: theme.colors.gray['200'],
      hoverColor: theme.colors.black.dark,
      hoverOpacity: 0.15,
      textColor: theme.colors.white.primary,
      textColorDisabled: theme.colors.gray['500'],
    },
    cta2: {
      backgroundColor: theme.colors.purple.primary,
      backgroundColorDisabled: theme.colors.gray['200'],
      hoverColor: theme.colors.black.dark,
      hoverOpacity: 0.15,
      textColor: theme.colors.white.primary,
      textColorDisabled: theme.colors.gray['500'],
    },
    dark: {
      backgroundColor: theme.colors.red.primary,
      backgroundColorDisabled: theme.colors.gray['200'],
      hoverColor: theme.colors.black.dark,
      hoverOpacity: 0.15,
      textColor: theme.colors.white.primary,
      textColorDisabled: theme.colors.gray['500'],
    },
    facebook: {
      backgroundColor: theme.colors.transparent.primary,
      backgroundColorDisabled: theme.colors.gray['200'],
      borderColor: theme.colors.social.facebook,
      hoverColor: theme.colors.transparent.dark,
      hoverOpacity: 0.15,
      textColor: theme.colors.social.facebook,
      textColorDisabled: theme.colors.gray['500'],
    },
    forYouUpsell: {
      // "Sunset - Reversed" background from figma
      background: 'linear-gradient(154.6deg, #F94E5C -27.55%, #793CB7 125.12%)',
      backgroundColorDisabled: theme.colors.gray['200'],
      hoverColor: theme.colors.black.dark,
      hoverOpacity: 0.15,
      textColor: theme.colors.white.primary,
      textColorDisabled: theme.colors.gray['500'],
    },
    googlePlus: {
      backgroundColor: theme.colors.transparent.primary,
      backgroundColorDisabled: theme.colors.gray['200'],
      borderColor: theme.colors.blue.primary,
      hoverColor: theme.colors.transparent.dark,
      hoverOpacity: 0.15,
      textColor: theme.colors.gray['500'],
      textColorDisabled: theme.colors.gray['500'],
    },
    instagram: {
      backgroundColor: theme.colors.social.instagram,
      backgroundColorDisabled: theme.colors.gray['200'],
      hoverColor: theme.colors.black.dark,
      hoverOpacity: 0.15,
      textColor: theme.colors.white.primary,
      textColorDisabled: theme.colors.gray['500'],
    },
    light: {
      backgroundColor: theme.colors.white.primary,
      backgroundColorDisabled: theme.colors.gray['300'],
      hoverColor: theme.colors.black.dark,
      hoverOpacity: 0.15,
      textColor: theme.colors.gray['600'],
      textColorDisabled: theme.colors.gray['500'],
    },
    pinterest: {
      backgroundColor: theme.colors.social.pinterest,
      backgroundColorDisabled: theme.colors.gray['200'],
      hoverColor: theme.colors.black.dark,
      hoverOpacity: 0.15,
      textColor: theme.colors.white.primary,
      textColorDisabled: theme.colors.gray['500'],
    },
    snapchat: {
      backgroundColor: theme.colors.social.snapchat,
      backgroundColorDisabled: theme.colors.gray['200'],
      hoverColor: theme.colors.black.dark,
      hoverOpacity: 0.15,
      textColor: theme.colors.white.primary,
      textColorDisabled: theme.colors.gray['500'],
    },
    tiktok: {
      backgroundColor: theme.colors.transparent.primary,
      backgroundColorDisabled: theme.colors.gray['200'],
      borderColor: theme.colors.gray['600'],
      hoverColor: theme.colors.transparent.dark,
      hoverOpacity: 0.15,
      textColor: theme.colors.gray['600'],
      textColorDisabled: theme.colors.gray['500'],
    },
    tumblr: {
      backgroundColor: theme.colors.social.tumblr,
      backgroundColorDisabled: theme.colors.gray['200'],
      hoverColor: theme.colors.black.dark,
      hoverOpacity: 0.15,
      textColor: theme.colors.white.primary,
      textColorDisabled: theme.colors.gray['500'],
    },
    x: {
      backgroundColor: theme.colors.social.x,
      backgroundColorDisabled: theme.colors.gray['200'],
      hoverColor: theme.colors.black.dark,
      hoverOpacity: 0.15,
      textColor: theme.colors.white.primary,
      textColorDisabled: theme.colors.gray['500'],
    },
    youtube: {
      backgroundColor: theme.colors.social.youtube,
      backgroundColorDisabled: theme.colors.gray['200'],
      hoverColor: theme.colors.black.dark,
      hoverOpacity: 0.15,
      textColor: theme.colors.white.primary,
      textColorDisabled: theme.colors.gray['500'],
    },
  };
  const themeVariables = merge(
    {},
    STYLE_TYPES[styleType] || STYLE_TYPES.dark,
    customStyles,
  );
  let hoverColor;

  if (themeVariables.hoverColor) {
    hoverColor = rgba(themeVariables.hoverColor, themeVariables.hoverOpacity);
  }

  return {
    background: themeVariables.background,
    backgroundColor: themeVariables.backgroundColor,
    border:
      themeVariables.borderColor ?
        `1px solid ${themeVariables.borderColor}`
      : 'none',
    color: themeVariables.textColor,
    display,
    margin: center ? 'auto' : 0,
    marginBottom: marginBottom ? '1.5rem' : 0,
    marginLeft,
    marginRight,
    marginTop,
    width: isBlock ? '100%' : 'auto',

    '&:not(:disabled):hover, &:not(:disabled):focus': {
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
      color: themeVariables.textColorDisabled,
    },

    'div svg': customSVGStyles || {
      fill: theme.colors.transparent.primary,
      height: '2.4rem',
      width: '2.4rem',
    },
  };
});

export default FilledButton;
