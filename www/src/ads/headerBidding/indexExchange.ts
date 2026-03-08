import getScript from 'utils/getScript';

// Index exchange does not require any configuration. It plugs straight into the GPT global.
export const loadIndexExchange = (scriptUrl: string) =>
  getScript(scriptUrl, null);
