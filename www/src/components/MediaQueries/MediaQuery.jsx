import Media from 'react-media';
import { noop } from 'lodash-es';

// jest uses jsdom which doesn't stub matchMedia, so if it isn't here we force all matches to false
if (typeof global !== 'undefined' && typeof global.window !== 'undefined') {
  global.window.matchMedia =
    global.window.matchMedia ||
    function matchMedia() {
      return {
        addListener: noop,
        matches: false,
        removeListener: noop,
      };
    };
}

export default function MediaQuery({
  maxWidth,
  index,
  breakPointArray = [],
  children,
}) {
  return (
    <Media query={{ maxWidth }}>
      {match => {
        const newBreakPointArray = [...breakPointArray];
        newBreakPointArray[index] = match;

        return children(newBreakPointArray);
      }}
    </Media>
  );
}
