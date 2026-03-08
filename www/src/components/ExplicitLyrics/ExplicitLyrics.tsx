import ExplicitContainer from './primitives/ExplicitContainer';
import useTranslate from 'contexts/TranslateContext/useTranslate';

interface Props {
  floatRight?: boolean;
  full?: boolean;
}

function ExplicitLyrics({ floatRight, full }: Props) {
  const translate = useTranslate();

  return (
    <ExplicitContainer
      floatRight={floatRight}
      full={full}
      title={translate('Explicit')}
    >
      {full ? translate('Explicit') : translate('E')}
    </ExplicitContainer>
  );
}

export default ExplicitLyrics;
