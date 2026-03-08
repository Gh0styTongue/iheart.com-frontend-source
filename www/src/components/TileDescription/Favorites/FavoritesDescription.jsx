import DefaultDescription from '../Default';
import useTranslate from 'contexts/TranslateContext/useTranslate';

export default function FavoritesDescription({ description, lines, dataTest }) {
  const translate = useTranslate();

  return (
    <DefaultDescription dataTest={dataTest} lines={lines}>
      {description || translate('All your favorite songs and artists.')}
    </DefaultDescription>
  );
}
