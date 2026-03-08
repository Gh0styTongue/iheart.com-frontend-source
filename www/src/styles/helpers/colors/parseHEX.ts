/* eslint-disable no-bitwise */

function parseHEX(color = '') {
  let c = color.substring(1).split('');

  // #fff #000 (3 char colors)
  if (c.length === 3) {
    c = [c[0], c[0], c[1], c[1], c[2], c[2]];
  }

  const cNum = Number(`0x${c.join('')}`);

  // here, using bitwise operators to get the actual values of each attr
  // basically, we're converting each hexadeciaml part to a binary number
  // hex digits [0-9] and [A-F] can be represented in binary (which is based on 0s and 1s)
  // below, we get the hex value and shift by certain number of bits (16 or 8) and get the binary representation
  // the '& 255` compares to make sure that binaries stay within 255 value (which is the max of color values)

  const r = (cNum >> 16) & 255; // right shift 16 bits
  const g = (cNum >> 8) & 255; // right shift 8 bits
  const b = cNum & 255;

  return {
    a: 1,
    b,
    g,
    r,
  };
}

export default parseHEX;
