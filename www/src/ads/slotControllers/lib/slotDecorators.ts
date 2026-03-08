/* eslint-disable no-param-reassign */
import logger, { CONTEXTS } from 'modules/Logger';
import ValidCompanions from 'ads/slotControllers/liveTritonAds/lib/ValidCompanions';
import { CustomAdCompanionData } from 'ads/types';
import {
  HTMLResource,
  IFrameResource,
  StaticResource,
  type TrackingEvent,
  ValidCompanionHeight,
  ValidDisplayCompanion,
} from 'iab-vast-parser';
import { TakeoverTypes } from 'ads/components/AdSlotContainer/types';
import type { AtLeastOneRequired } from 'types/utilityTypes';

function fireTrackingEvents(
  trackingEvents: Array<TrackingEvent>,
  slotEl: HTMLElement,
) {
  trackingEvents.forEach((trackingEvent: TrackingEvent, i: number) => {
    logger.info(
      [CONTEXTS.ADS],
      `firing creativeView pixel: ${trackingEvent.uri}`,
    );

    const impression = document.createElement('img');
    impression.style.height = '0';
    impression.style.width = '0';
    impression.style.display = 'none';
    impression.src = trackingEvent.uri;
    impression.id = `viewtrack-url-${i + 1}`;
    slotEl.appendChild(impression);
  });
}

/**
 * returns a function that takes in an iframe and sets src and some attrs to ensure correct display
 * @param height, the height of the ad
 * @param companion to render
 */
export function decorateTritonIframe(
  height: ValidCompanionHeight,
  companion: ValidDisplayCompanion<IFrameResource>,
) {
  return (slotEl: HTMLElement) => {
    logger.info([CONTEXTS.ADS], 'decorating Triton iframe companion');
    fireTrackingEvents(companion.trackingEvents.get('creativeView'), slotEl);

    (slotEl as HTMLIFrameElement).src = companion.resource.uri;
    (slotEl as HTMLIFrameElement).name = 'adFrame';
    (slotEl as HTMLIFrameElement).scrolling = 'no';
    (slotEl as HTMLIFrameElement).title = 'adFrame';
    (slotEl as HTMLIFrameElement).frameBorder = '0';
    (slotEl as HTMLIFrameElement).style.height = `${height}px`;
    (slotEl as HTMLIFrameElement).style.width =
      `${ValidCompanions.COMPANION_WIDTH}px`;
    (slotEl as HTMLIFrameElement).style.maxHeight =
      `${ValidCompanions.COMPANION_HEIGHT}px`;
    (slotEl as HTMLIFrameElement).style.maxWidth =
      `${ValidCompanions.COMPANION_WIDTH}px`;
  };
}

export function decorateAdswizzIframe(
  src: string,
  dimensions: Array<[number, number]>,
) {
  return (slotEl: HTMLElement) => {
    (slotEl as HTMLIFrameElement).src = src;
    (slotEl as HTMLIFrameElement).name = 'adFrame';
    (slotEl as HTMLIFrameElement).scrolling = 'no';
    (slotEl as HTMLIFrameElement).title = 'adFrame';
    (slotEl as HTMLIFrameElement).frameBorder = '0';
    (slotEl as HTMLIFrameElement).style.height = `${dimensions[0][1]}px`;
    (slotEl as HTMLIFrameElement).style.width = `${dimensions[0][0]}px`;
    (slotEl as HTMLIFrameElement).style.maxHeight =
      `${ValidCompanions.COMPANION_HEIGHT}px`;
    (slotEl as HTMLIFrameElement).style.maxWidth =
      `${ValidCompanions.COMPANION_WIDTH}px`;
  };
}

/**
 * returns a function that adds an html literal ad to the passed in element.
 * @param companion companion to render
 */
export function decorateTritonHtml(
  companion: ValidDisplayCompanion<HTMLResource>,
) {
  return (slotEl: HTMLElement) => {
    logger.info([CONTEXTS.ADS], 'decorating Triton html companion');
    fireTrackingEvents(companion.trackingEvents.get('creativeView'), slotEl);

    const htmlCompanion = document.createElement('iframe');
    htmlCompanion.width = companion.width.toString();
    htmlCompanion.height = companion.height.toString();
    htmlCompanion.style.border = 'none';
    htmlCompanion.srcdoc = `<style>body {padding:0; margin:0; position:fixed;}</style>${companion?.resource.uri}`;

    slotEl.appendChild(htmlCompanion);
  };
}

/**
 * returns a function that adds an image ad with tracking pixels and potentially a link to the passed in element.
 * @param companion companion to render
 */
export function decorateTritonStatic(
  companion: ValidDisplayCompanion<StaticResource>,
) {
  return (slotEl: HTMLElement) => {
    logger.info([CONTEXTS.ADS], 'decorating Triton static companion');
    let imageParent = slotEl;

    fireTrackingEvents(companion.trackingEvents.get('creativeView'), slotEl);

    // if we're give a link, append it so that it can wrap the image
    if (companion.clickThrough) {
      const bannerLink = document.createElement('a');
      bannerLink.href = companion.clickThrough.uri;
      bannerLink.id = companion.clickThrough.id || '';
      bannerLink.target = '_blank';
      slotEl.appendChild(bannerLink);

      imageParent = bannerLink;
    }

    // create and attach the ad image
    const image = document.createElement('img');
    image.style.border = '0';
    image.src = companion.resource.uri;
    image.id = 'banner';
    imageParent.appendChild(image);
  };
}

export function decorateCustomCompanion(customAdData: CustomAdCompanionData) {
  return (slotEl: HTMLElement) => {
    const htmlCompanion = document.createElement('iframe');
    htmlCompanion.width = customAdData.width;
    htmlCompanion.height = customAdData.height;
    htmlCompanion.style.border = 'none';
    htmlCompanion.style.maxHeight = `${ValidCompanions.COMPANION_HEIGHT}px`;
    htmlCompanion.style.maxWidth = `${ValidCompanions.COMPANION_WIDTH}px`;
    htmlCompanion.srcdoc = `<style>body {padding:0; margin:0; position:fixed;}</style>${customAdData?.resource}`;

    slotEl.appendChild(htmlCompanion);
  };
}

export function makeTakeoverDecorator(
  imageKey: 'rightImg' | 'leftImg' | 'heroImg',
  callbackName: TakeoverTypes,
) {
  return (slotEl: HTMLElement): void => {
    window[callbackName] = ({
      backgroundColor,
      trackingUrl,
      ...adProps
    }: AtLeastOneRequired<{
      leftImg: string;
      rightImg: string;
      heroImg: string;
    }> & {
      backgroundColor: string;
      trackingUrl: string;
    }) => {
      const img = adProps[imageKey] as string;
      if (img) {
        if (backgroundColor) {
          const background = document.createElement('div');
          background.style.backgroundColor = backgroundColor;
          background.style.position = 'absolute';
          background.style.height = '100vh';
          background.style.width = '100%';
          slotEl.appendChild(background);
        }

        const imgTag = document.createElement('img');
        imgTag.src = img.replace(
          /http:\/\/img.ccrd.clearchannel.com\/media\//g,
          'https://media.iheart.com/cc-common/',
        );
        imgTag.style.position = 'absolute';
        slotEl.appendChild(imgTag);

        if (trackingUrl) {
          const trackingPixel = document.createElement('img');
          trackingPixel.src = trackingUrl;
          slotEl.appendChild(trackingPixel);
        }
      }
    };
  };
}

export function heroTakeoverSlotDecorator(slotEl: HTMLElement): void {
  window[TakeoverTypes.Hero] = ({
    backgroundColor,
    trackingUrl,
    heroImg,
  }: {
    heroImg: string;
    backgroundColor: string;
    trackingUrl: string;
  }) => {
    if (heroImg) {
      slotEl.style.position = 'relative';
      slotEl.style.width = '100%';
      slotEl.style.height = '100%';

      if (backgroundColor) {
        const background = document.createElement('div');
        background.style.backgroundColor =
          backgroundColor.startsWith('#') ? backgroundColor : (
            `#${backgroundColor}`
          );
        background.style.position = 'absolute';
        background.style.height = '100%';
        background.style.width = '100%';
        background.id = 'hero-ad-background';
        slotEl.appendChild(background);
      }

      const imgTag = document.createElement('img');
      imgTag.src = heroImg.replace(
        /http:\/\/img.ccrd.clearchannel.com\/media\//g,
        'https://media.iheart.com/cc-common/',
      );
      imgTag.style.position = 'absolute';
      imgTag.style.height = '100%';
      slotEl.appendChild(imgTag);

      if (trackingUrl) {
        const trackingPixel = document.createElement('img');
        trackingPixel.src = trackingUrl;
        slotEl.appendChild(trackingPixel);
      }
    }
  };
}
