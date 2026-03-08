import NavLink from 'components/NavLink';
import NavRight from 'styles/icons/NavRight';
import NewEpisodeBadge from 'components/NewEpisodeBadge/NewEpisodeBadge';
import PlayWrapper from './primitives/PlayWrapper';
import RowWrapper from './primitives/RowWrapper';
import ShouldShow from 'components/ShouldShow';
import Subtitle from './primitives/Subtitle';
import TextWrapper from './primitives/TextWrapper';
import theme from 'styles/themes/default';
import ThumbWrapper from './primitives/ThumbWrapper';
import Title from './primitives/Title';
import Truncate from 'components/Truncate';
import type { ReactNode } from 'react';

type Props = {
  imageComponent: ReactNode;
  isRoundImage?: boolean;
  newEpisodeCount?: number;
  playButtonComponent?: ReactNode;
  subtitleComponent: ReactNode;
  title: ReactNode;
  titleComponent?: ReactNode;
  url: string;
};

function Row({
  imageComponent,
  isRoundImage,
  newEpisodeCount,
  playButtonComponent,
  subtitleComponent,
  title,
  titleComponent,
  url,
}: Props) {
  return (
    <RowWrapper data-test="your-library-mobile-row">
      <NewEpisodeBadge applyMobileStyles newEpisodeCount={newEpisodeCount} />
      <ThumbWrapper isRoundImage={isRoundImage}>
        <ShouldShow shouldShow={!!playButtonComponent}>
          <PlayWrapper>{playButtonComponent}</PlayWrapper>
        </ShouldShow>

        {imageComponent}
      </ThumbWrapper>

      <TextWrapper to={url}>
        <Title newEpisodeCount={newEpisodeCount}>
          <ShouldShow
            hiddenElement={<Truncate lines={1}>{title}</Truncate>}
            shouldShow={!!titleComponent}
          >
            {titleComponent}
          </ShouldShow>
        </Title>

        <Subtitle>{subtitleComponent}</Subtitle>
      </TextWrapper>

      <NavLink to={url}>
        <NavRight color={theme.colors.gray['400']} />
      </NavLink>
    </RowWrapper>
  );
}

export default Row;
