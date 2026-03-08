import parseHEX from './parseHEX';
import parseRGB from './parseRGB';

type RGBObject = {
  r: number;
  g: number;
  b: number;
};

/*
  function rgba
  max a rgba color value based on color, and opacity passed in
  @param {color} String color - hex, rgb, or rgba color
  @param {opacity} Number opacity to apply as alpha value

  @example
  rgba('#EAEDEF', 0.1) returns 'rgba(234, 237, 239, 0.1)'

  @example
  rgba('rgba(123, 123, 23)', 0.1) returns 'rgba(123,  123,  23, 0.1)'

  @example
  rgba('rgb(255, 255, 255)', 0.1) returns 'rgba(255,  255,  255, 0.1)'
*/

function rgbaBuilder(color: string, a: number) {
  const { b, g, r }: RGBObject =
    color.includes('#') ? parseHEX(color) : parseRGB(color);

  if (r >= 0 && g >= 0 && b >= 0) {
    return `rgba(${r}, ${g}, ${b}, ${a})`;
  }

  return color;
}

export default rgbaBuilder;
