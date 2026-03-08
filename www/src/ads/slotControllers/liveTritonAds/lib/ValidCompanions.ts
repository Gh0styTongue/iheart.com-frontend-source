import DimensionCompanions from 'ads/slotControllers/liveTritonAds/lib/DimensionCompanions';
import type {
  ValidCompanionHeight,
  ValidDisplayCompanion,
} from 'iab-vast-parser';

type DimensionDetails = {
  dimensionCompanions: DimensionCompanions | undefined;
  height: ValidCompanionHeight;
};

export default class ValidCompanions {
  static COMPANION_WIDTH = 300;

  // Per current spec, only 300 x 250 companion ads should
  // be displayed. Set COMPANION_HEIGHT = null to fallback to
  // the priority height list ACCEPTABLE_COMPANION_HEIGHTS.
  static COMPANION_HEIGHT: ValidCompanionHeight | null = 250;

  // The tuple below represents the possible, related heights for
  // 300 width companions returned by Triton.
  static ACCEPTABLE_COMPANION_HEIGHTS: Array<ValidCompanionHeight> = [
    250, 300, 600,
  ];

  250?: DimensionCompanions;

  300?: DimensionCompanions;

  600?: DimensionCompanions;

  /**
   * Adds the companion at the right key for it's slot, appending if we already have
   * at least one companion and instantiating a DimensionCompanion otherwise.
   * @param companion a single companion object WITH VALID DIMENSIONS
   */
  add(companion: ValidDisplayCompanion) {
    const dimension = this[companion.height];

    if (dimension) {
      dimension.add(companion);
    } else {
      this[companion.height] = new DimensionCompanions(companion);
    }
  }

  /**
   * returns true if we have at least one companion of each type for each size.
   */
  isFull() {
    return this[250]?.isFull() && this[300]?.isFull() && this[600]?.isFull();
  }

  /**
   * if we have a specific height return the set of assets that we have for
   * that dimension, otherwise find the first companion with a supported height
   */
  getAvailableDimension(): DimensionDetails {
    return ValidCompanions.COMPANION_HEIGHT ?
        {
          dimensionCompanions: this[ValidCompanions.COMPANION_HEIGHT],
          height: ValidCompanions.COMPANION_HEIGHT,
        }
      : this.getAvailableDimensionByPriority();
  }

  /**
   * find the first companion with a supported height.
   */
  private getAvailableDimensionByPriority(): DimensionDetails {
    let dimensionCompanions: DimensionCompanions | undefined;
    let index = 0;
    let height = ValidCompanions.ACCEPTABLE_COMPANION_HEIGHTS[index];

    while (
      !dimensionCompanions &&
      index < ValidCompanions.ACCEPTABLE_COMPANION_HEIGHTS.length
    ) {
      height = ValidCompanions.ACCEPTABLE_COMPANION_HEIGHTS[index];
      const currentDimension = this[height];

      if (currentDimension) dimensionCompanions = currentDimension;

      index += 1;
    }

    return { dimensionCompanions, height };
  }
}
