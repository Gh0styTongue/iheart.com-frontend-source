import { CustomAdTypes } from '../constants';

/**
 * Returns the Adswizz listenerId or an empty string (in the case our adProvider isn't Adswizz)
 */
export default function getListenerId(adType: CustomAdTypes): string {
  if (adType === CustomAdTypes.Adswizz) {
    return window?.com_adswizz_synchro_getListenerId?.() ?? '';
  }

  return '';
}
