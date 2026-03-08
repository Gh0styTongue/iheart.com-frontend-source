import AdSlotContainer from './AdSlotContainer';
import UnwrappedDisplayAdSlotContainer from './DisplayAdSlotContainer';
import UnwrappedPlaybackAdSlotContainer from './PlaybackAdSlotContainer';
import UnwrappedTakeoverAdSlotContainer from './TakeoverAdSlotContainer';
import withAdsErrorBoundary from './lib/withAdsErrorBoundary';

export { default as FSPAdDiv } from './primitives/FullScreen';
export { default as RightRailAdDiv } from './primitives/RightRail';
export { default as HeaderAdDiv } from './primitives/Header';
export { default as HeroAdDiv } from './primitives/Hero';
export {
  LeftSideBurn as LeftSideBurnAdDiv,
  RightSideBurn as RightSideBurnAdDiv,
} from './primitives/Sideburn';

export default withAdsErrorBoundary(AdSlotContainer);

const PlaybackAdSlotContainer = withAdsErrorBoundary(
  UnwrappedPlaybackAdSlotContainer,
);
const DisplayAdSlotContainer = withAdsErrorBoundary(
  UnwrappedDisplayAdSlotContainer,
);
const TakeoverAdSlotContainer = withAdsErrorBoundary(
  UnwrappedTakeoverAdSlotContainer as typeof AdSlotContainer,
) as typeof UnwrappedTakeoverAdSlotContainer;

export {
  DisplayAdSlotContainer,
  PlaybackAdSlotContainer,
  TakeoverAdSlotContainer,
};
