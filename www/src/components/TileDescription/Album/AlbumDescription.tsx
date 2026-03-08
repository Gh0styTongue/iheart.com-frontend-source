import DefaultDescription from '../Default';
import useTranslate from 'contexts/TranslateContext/useTranslate';
import { getShortMonth } from 'utils/time/dates';

type Props = {
  dataTest?: string;
  lines?: number;
  releaseDate: number;
  totalSongs: number;
};

function AlbumDescription({
  totalSongs,
  releaseDate,
  lines = 2,
  dataTest,
}: Props) {
  const translate = useTranslate();

  const dateReleased = `${getShortMonth(
    new Date(releaseDate).getUTCMonth() + 1, // getMonth returns january as 0, so we have to increment
    translate,
  )} ${new Date(releaseDate).getFullYear()}`;

  const songCount = translate(['1 song', '{n} songs', 'n'], { n: totalSongs });

  return (
    <DefaultDescription dataTest={dataTest} lines={lines}>
      {`${dateReleased} ${String.fromCharCode(8226)} ${songCount}`}
    </DefaultDescription>
  );
}

export default AlbumDescription;
