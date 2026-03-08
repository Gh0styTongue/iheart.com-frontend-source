import parseHEX from './parseHEX';
import parseRGB from './parseRGB';

function darken(color: string, amount: number) {
  const delta = amount * 100;

  function getDarkenedAmount(attr: number) {
    const result = attr + delta;
    if (result > 255) return 255;
    return result;
  }

  let rgb: Partial<{ a: number; r: number; g: number; b: number }> = {};
  if (color.includes('#')) {
    rgb = parseHEX(color);
  } else if (color.includes('rgb')) {
    rgb = parseRGB(color);
  }

  const { r, g, b, a } = rgb;

  return `rgba(${getDarkenedAmount(r!)}, ${getDarkenedAmount(
    g!,
  )}, ${getDarkenedAmount(b!)}, ${a})`;
}

export default darken;
