import Badge from './primitives/Badge';
import useTranslate from 'contexts/TranslateContext/useTranslate';

const NewEpisodeBadge = ({
  applyMobileStyles = false,
  hideCount = false,
  newEpisodeCount,
}: {
  applyMobileStyles?: boolean;
  hideCount?: boolean;
  newEpisodeCount?: number;
}) => {
  const translate = useTranslate();

  return newEpisodeCount ?
      <Badge applyMobileStyles={applyMobileStyles} hideCount={hideCount}>
        {hideCount ? '' : newEpisodeCount} {translate('NEW')}
      </Badge>
    : null;
};

export default NewEpisodeBadge;
