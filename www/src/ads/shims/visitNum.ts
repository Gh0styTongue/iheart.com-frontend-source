import localStorage from 'utils/localStorage';

const VISITNUM_KEY = 'ihr-visits';

export const getVisitNum = (): number => {
  if (!__CLIENT__) {
    return -1;
  }
  return localStorage.getItem<number>(VISITNUM_KEY, 0);
};

export const incrementVisitNum = () => {
  if (!__CLIENT__) {
    return;
  }
  localStorage.setItem(VISITNUM_KEY, getVisitNum() + 1);
};
