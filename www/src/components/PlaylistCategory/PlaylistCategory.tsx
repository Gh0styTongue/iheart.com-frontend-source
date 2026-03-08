import CategoryTiles from './CategoryTiles';
import { PlaylistCategory as Category, CategoryTitle } from './primitives';
import {
  getAllAccessPreview,
  getIsTrialEligible,
  getSubscriptionType,
} from 'state/Entitlements/selectors';
import { makeGetTilesByCategory } from 'state/PlaylistDirectory/selectors';
import { useSelector } from 'react-redux';
import type { State } from 'state/types';

type Props = {
  aspectRatio?: number;
  category: {
    facets: string;
    collection: string;
  };
  dataTest?: string;
  itemSelectedLocation?: string;
  name: string;
  playedFrom: number;
  showAllTiles?: boolean;
  subtitleLines?: number;
  tilesInRow: number;
  titleLines?: number;
};

function PlaylistCategory({
  aspectRatio = 1,
  category,
  dataTest,
  itemSelectedLocation = '',
  name,
  playedFrom,
  showAllTiles = false,
  subtitleLines,
  tilesInRow,
  titleLines,
}: Props) {
  const tilesByCategory = useSelector((state: State) =>
    makeGetTilesByCategory()(state, { category }),
  );
  const allAccessPreview = useSelector(getAllAccessPreview);
  const isTrialEligible = useSelector(getIsTrialEligible);
  const subscriptionType = useSelector(getSubscriptionType);

  if (!tilesByCategory || !tilesByCategory.length) return null;

  return (
    <Category data-test={dataTest}>
      <CategoryTitle>{name}</CategoryTitle>
      <CategoryTiles
        allAccessPreview={allAccessPreview}
        aspectRatio={aspectRatio}
        isTrialEligible={isTrialEligible}
        itemSelectedLocation={itemSelectedLocation}
        playedFrom={playedFrom}
        showAllTiles={showAllTiles}
        subscriptionType={subscriptionType}
        subtitleLines={subtitleLines}
        tiles={tilesByCategory}
        tilesInRow={tilesInRow}
        titleLines={titleLines}
      />
    </Category>
  );
}

export default PlaylistCategory;
