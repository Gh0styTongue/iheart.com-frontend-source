import Background from './Background';
import Wrapper from './primitives/Wrapper';
import { BREAKPOINTS } from 'constants/responsive';
import {
  HeroAdDiv,
  TakeoverAdSlotContainer,
} from 'ads/components/AdSlotContainer';
import { MediaQueries } from 'components/MediaQueries';
import { SLOT_DIMENSIONS } from 'ads/constants';
import { TakeoverTypes } from 'ads/components/AdSlotContainer/types';
import { useCallback, useState } from 'react';

type Props = {
  backgroundColor?: string;
  backgroundGradient?: string;
  noMask?: boolean;
  primaryBackground?: any;
  tabletBackground?: any;
};

function HeroBackground({
  backgroundColor,
  backgroundGradient,
  primaryBackground,
  tabletBackground,
  noMask = true,
}: Props) {
  const [showTakeover, setShowTakeover] = useState(false);
  const setEmpty = useCallback(() => setShowTakeover(false), [setShowTakeover]);
  const setPopulated = useCallback(
    () => setShowTakeover(true),
    [setShowTakeover],
  );

  return (
    <Wrapper backgroundColor={backgroundColor}>
      {primaryBackground && !showTakeover ?
        <Background
          backgroundColor={backgroundColor}
          backgroundGradient={backgroundGradient}
          backgroundImage={primaryBackground}
          noMask
          tabletBackground={!!tabletBackground}
          tabletBackgroundStyles={false}
        />
      : null}
      {!showTakeover ?
        <Background
          backgroundColor={backgroundColor}
          backgroundGradient={backgroundGradient}
          backgroundImage={tabletBackground}
          noMask={noMask}
          tabletBackground={!!tabletBackground}
          tabletBackgroundStyles
        />
      : null}
      <MediaQueries maxWidths={[BREAKPOINTS.LARGE]}>
        {([isMobile]: [boolean]) =>
          isMobile ? null : (
            <TakeoverAdSlotContainer
              ccrpos="2013"
              ContainerPrimitive={HeroAdDiv}
              dimensions={SLOT_DIMENSIONS.HERO}
              onEmpty={setEmpty}
              onPopulated={setPopulated}
              style={showTakeover ? {} : { width: 0 }}
              takeoverType={TakeoverTypes.Hero}
            />
          )
        }
      </MediaQueries>
    </Wrapper>
  );
}

export default HeroBackground;
