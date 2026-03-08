import type {
  HTMLResource,
  IFrameResource,
  StaticResource,
  ValidDisplayCompanion,
} from 'iab-vast-parser';

// this class holds up to three ads per size
// one of each supported $type.
export default class DimensionCompanions {
  iframe?: ValidDisplayCompanion<IFrameResource>;

  staticResource?: ValidDisplayCompanion<StaticResource>;

  html?: ValidDisplayCompanion<HTMLResource>;

  constructor(companion: ValidDisplayCompanion) {
    this.add(companion);
  }

  /**
   * adds a new companion instance per it's $type.
   * Note that only one of each type is possible on a single DimesionCompanions object.
   * @param companion
   */
  add(companion: ValidDisplayCompanion) {
    if (this.hasHtmlResource(companion)) {
      this.html = companion;
    } else if (this.hasIframeResource(companion)) {
      this.iframe = companion;
    } else if (this.hasStaticResource(companion)) {
      this.staticResource = companion;
    }
  }

  /**
   * checks if all types are filled.
   */
  isFull() {
    return this.iframe && this.staticResource && this.html;
  }

  /**
   * returns true if the companion argument has an HTML resource (raw html to be pushed directly to the DOM)
   * @param companion to check
   */
  private hasHtmlResource(
    companion: ValidDisplayCompanion,
  ): companion is ValidDisplayCompanion<HTMLResource> {
    return companion.resource.$type === 'HTMLResource';
  }

  /**
   * returns true if the companion argument has an iFrame resource.
   * @param companion to check
   */
  private hasIframeResource(
    companion: ValidDisplayCompanion,
  ): companion is ValidDisplayCompanion<IFrameResource> {
    return companion.resource.$type === 'IFrameResource';
  }

  /**
   * returns true if the companion argument has an image resource (to be rendered with impressions and potentially an anchor wrapper)
   * @param companion to check
   */
  private hasStaticResource(
    companion: ValidDisplayCompanion,
  ): companion is ValidDisplayCompanion<StaticResource> {
    return companion.resource.$type === 'StaticResource';
  }
}
