import dynamicBackgroundFactory from './helpers/dynamicBackground';
import { useCallback, useMemo, useState } from 'react';

function useDynamicBackground(
  transparency = 50,
): [(e: Event) => void, { background: Array<string> }] {
  const [colorThief, dynamicBackground] = useMemo(dynamicBackgroundFactory, []);

  const [backgroundCss, setBackgroundCss] = useState({
    background: ['black'],
  });

  const loadImage = useCallback(
    (e: Event) => {
      const genBackgroundColor = dynamicBackground(
        e.currentTarget as HTMLImageElement,
        colorThief,
      );
      const newCss = {
        background: [
          `rgb(${genBackgroundColor[0]},${genBackgroundColor[1]},${genBackgroundColor[2]})`,
          `linear-gradient(rgba(${genBackgroundColor[0]},${genBackgroundColor[1]},${genBackgroundColor[2]}, 0.5), transparent ${transparency}%)`,
        ],
      };
      setBackgroundCss(newCss);
    },
    [colorThief, dynamicBackground, transparency],
  );

  return [loadImage, backgroundCss];
}

export default useDynamicBackground;
