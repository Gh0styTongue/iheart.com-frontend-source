import localStorage from 'utils/localStorage';

const getPermutive = (): Array<string> | null => {
  if (!__CLIENT__) {
    return null;
  }
  return localStorage.getItem<Array<string> | null>('_pdfps', null);
};

export default getPermutive;
