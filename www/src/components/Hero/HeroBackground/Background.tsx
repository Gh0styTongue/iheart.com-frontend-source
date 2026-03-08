import BackgroundWrapper from './primitives/BackgroundWrapper';
import Mask from './primitives/Mask';

type Props = {
  backgroundColor?: string;
  backgroundGradient?: string;
  backgroundImage: Element;
  noMask: boolean;
  tabletBackground: boolean;
  tabletBackgroundStyles: boolean;
};

function HeroBackground({
  backgroundColor,
  backgroundImage,
  backgroundGradient,
  noMask,
  tabletBackground,
  tabletBackgroundStyles,
}: Props) {
  const style =
    backgroundGradient ?
      { backgroundImage: backgroundGradient }
    : { backgroundColor };
  const mask = noMask ? null : <Mask />;

  return (
    <BackgroundWrapper
      style={style}
      tabletBackground={tabletBackground}
      tabletBackgroundStyles={tabletBackgroundStyles}
    >
      {backgroundGradient ? null : backgroundImage}
      {mask}
    </BackgroundWrapper>
  );
}

export default HeroBackground;
