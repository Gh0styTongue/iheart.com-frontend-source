import Artwork from './primitives/Artwork';
import CenterColumn from './primitives/CenterColumn';
import Container from './primitives/Container';
import Controls from './Controls';
import ControlSets from './ControlSets';
import LeftColumn from './primitives/LeftColumn';
import Line from './Line';
import Overflows from './Overflows';
import PlayerColorProvider from 'contexts/PlayerColor/PlayerColorProvider';
import RightColumn from './primitives/RightColumn';
import Text from './primitives/Text';
import theme from 'styles/themes/default';
import usePlayerState from 'contexts/PlayerState/usePlayerState';
import ZIndexProvider from 'contexts/zIndexContext/zIndexProvider';
import { fit } from 'utils/mediaServerImageMaker/opsString';

import { getWelcome } from 'state/Stations/selectors';
import { StationType } from './types';
import { useSelector } from 'react-redux';
import type { State } from 'state/types';

function Player() {
  const hidePlayer = useSelector<State, boolean>(getWelcome);
  const state = usePlayerState();

  if (hidePlayer || state === null) return null;

  const ControlSet = ControlSets[state.stationType as StationType];
  const Overflow = Overflows[state.stationType as StationType];

  return (
    <ZIndexProvider zIndex={theme.zIndex.fullscreenPlayer}>
      <PlayerColorProvider color={theme.colors.gray['600']}>
        <Container data-test="player-container">
          <LeftColumn data-test="player-left-column">
            <Controls.Play />
            <Artwork
              alt="Player Artwork Image"
              aspectRatio={1}
              data-test="player-artwork-image"
              ops={[fit(75, 75)]}
              src={state.baseImageUrl}
            />
            <Text data-test="player-text">
              <Line to={state.sourceUrl}>{state.sourceName}</Line>
              <Line to={state.mainUrl}>{state.mainText}</Line>
              <Line
                hidden={state.stationType === StationType.Podcast}
                to={state.descriptionUrl}
              >
                {state.descriptionText}
              </Line>
            </Text>
          </LeftColumn>
          <CenterColumn>
            <ControlSet />
          </CenterColumn>
          <RightColumn data-test="player-right-column">
            <Controls.ControlSet>
              <Controls.Thumbs />
              <Overflow />
              <Controls.Expand />
            </Controls.ControlSet>
          </RightColumn>
        </Container>
      </PlayerColorProvider>
    </ZIndexProvider>
  );
}

export default Player;
