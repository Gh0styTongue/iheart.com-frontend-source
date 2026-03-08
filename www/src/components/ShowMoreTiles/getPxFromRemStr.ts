import fonts from 'styles/fonts';

const getNumberFromRemStr = (dimensionRemStr: string) =>
  Number(dimensionRemStr?.match?.(/\d+(\.\d+)?/)?.[0]);

const pxToRemRatio = 16 / getNumberFromRemStr(fonts.size['16']) || 10;

const getPxFromRemStr = (dimensionRemStr: string) =>
  getNumberFromRemStr(dimensionRemStr) * pxToRemRatio;

export default getPxFromRemStr;
