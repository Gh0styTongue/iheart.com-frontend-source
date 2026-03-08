import type { AdSlotControllerName } from 'ads/slotControllers/types';

const NAME_ATTRIBUTE = 'data-slot-controller-name';

export function buildSlotNodeId(
  name: AdSlotControllerName,
  dimensions: Array<[number, number]>,
  ...others: Array<string>
) {
  return `${name}_${others.join('-')}-${dimensions
    .map(dimArr => dimArr.join('x'))
    .join('-')}`;
}

const createAdSlotNode = (
  controllerName: AdSlotControllerName,
  el: HTMLDivElement,
  slotElId: string,
  tagName = 'DIV',
  decorateEl?: (slotEl: HTMLElement) => void,
): HTMLElement => {
  const containerEl = el as NonNullable<typeof el>;

  // Attach the DOM node
  const slotEl = document.createElement(tagName) as HTMLElement;
  slotEl.setAttribute('id', slotElId);
  slotEl.setAttribute(NAME_ATTRIBUTE, controllerName);

  if (decorateEl) decorateEl(slotEl);

  containerEl.appendChild(slotEl);

  return slotEl;
};

export default createAdSlotNode;
