import invariant from 'invariant';

const defaultOptions = {
  async: false,
  defer: false,
  isGpt: false,
  noCache: false,
  persist: true,
};

type Opts = {
  async: boolean;
  defer: boolean;
  isGpt: boolean;
  noCache: boolean;
  persist: boolean;
};

type This = {
  onload?: ((this: GlobalEventHandlers, ev: Event) => any) | null;
  readyState?: string;
};

interface HTMLScriptElementExtra extends HTMLScriptElement {
  onreadystatechange?: ((this: GlobalEventHandlers, ev: Event) => any) | null;
}

// lift of app/weblibjs/utils/common.js's getScript() which is a lift of $.getScript
export default async function getScript(
  script: string,
  id: string | null = null,
  partialOpts: Partial<Opts> = {},
): Promise<void> {
  // Don't require callers to pass all options values. Let them pass any subset and use default values for the rest.
  const opts: Opts = { ...defaultOptions, ...partialOpts };
  let src = script;

  invariant(__CLIENT__, 'getScript called outside of browser');
  invariant(
    typeof src === 'string',
    `src required to be of type string, received ${src}`,
  );

  // Cache bust this script unless we don't want to
  if (opts.noCache) {
    if (src.indexOf('?') > -1) {
      src += `&_=${Date.now()}`;
    } else {
      src += `?_=${Date.now()}`;
    }
  }

  return new Promise(resolve => {
    let done = false;

    const scriptTag: HTMLScriptElementExtra = document.createElement('script');
    if (id) scriptTag.id = id;
    scriptTag.type = 'text/javascript';
    scriptTag.async = opts.async;
    scriptTag.defer = opts.defer;
    scriptTag.src = src;

    const head =
      document.getElementsByTagName('head')[0] || document.documentElement;
    function onLoad(this: This) {
      if (
        !done &&
        (!this.readyState ||
          this.readyState === 'loaded' ||
          this.readyState === 'complete')
      ) {
        done = true;
        // Handle memory leak in IE
        scriptTag.onload = null;
        scriptTag.onreadystatechange = null;
        if (!opts.persist && head && scriptTag.parentNode) {
          head.removeChild(scriptTag);
        }

        if (opts && opts.isGpt) {
          window.googletag.cmd.push(resolve);
        } else {
          resolve();
        }
      }
    }

    scriptTag.onload = onLoad;
    scriptTag.onreadystatechange = onLoad;

    head.insertBefore(scriptTag, head.firstChild);
  });
}
