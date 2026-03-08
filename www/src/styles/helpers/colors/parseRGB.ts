function parseRGB(color: string) {
  const splitColors = color.split('(')[1].split(')')[0].split(',');

  return {
    a: Number(splitColors[3] || 1),
    b: Number(splitColors[2]),
    g: Number(splitColors[1]),
    r: Number(splitColors[0]),
  };
}

export default parseRGB;
