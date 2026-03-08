import logger, { CONTEXTS } from 'modules/Logger';
import type ColorThiefType from 'colorthief';

const ColorThief = __CLIENT__ ? require('colorthief').default : null;

export function findClosestColor(colorArray: Array<number>): Array<number> {
  const closestColors: Array<Array<number>> = [
    [0, 0, 0], // base case in first index
    [60, 162, 221],
    [96, 186, 198],
    [113, 114, 119],
    [120, 210, 151],
    [160, 113, 220],
    [226, 44, 58],
    [241, 117, 195],
    [252, 158, 101],
    [253, 211, 111],
  ];

  let distanceSq: number;
  let minDistanceSq = Infinity;
  let value = closestColors[0];

  for (let i = 1; i < closestColors.length; i += 1) {
    const [r, g, b] = closestColors[i];

    distanceSq =
      (colorArray[0] - r) ** 2 +
      (colorArray[1] - g) ** 2 +
      (colorArray[2] - b) ** 2;

    if (distanceSq < minDistanceSq) {
      minDistanceSq = distanceSq;
      value = closestColors[i];
    }
  }

  return value;
}

export function dynamicBackground(
  image: HTMLImageElement,
  colorThief: ColorThiefType,
): Array<number> {
  let backgroundColor = [0, 0, 0];

  if (image) {
    try {
      const ctBackgroundArray = colorThief.getColor(image, 5);

      if (ctBackgroundArray) {
        backgroundColor = findClosestColor(ctBackgroundArray);
      }
    } catch (e: any) {
      const errObj = e instanceof Error ? e : new Error(e);
      logger.error([CONTEXTS.PLAYER], errObj.message, {}, errObj);
    }
  }

  return backgroundColor;
}

function factory(): [ColorThiefType, typeof dynamicBackground] {
  if (!ColorThief) {
    return [
      {
        getColor: () => [0, 0, 0],
      },
      function noop(): Array<number> {
        return [0, 0, 0];
      },
    ];
  }

  const colorThief = new ColorThief();

  return [colorThief, dynamicBackground];
}

export default factory;
