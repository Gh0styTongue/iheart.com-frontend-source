// the reason this file is here is because we need a way to ensure that we don't try to get the power amp url before apply config is called.
// if we do it in the root scope of a file then it will be evaluated at the point that it is required.  We import at the top of files so it'll be
// evaluated before any business logic is run.
import factory from 'state/factory';
import { getAmpUrl } from 'state/Config/selectors';

const store = factory();

function getPowerAmpUrl() {
  const baseUrl = getAmpUrl(store.getState()) || 'https://www.iheart.com/';
  return [
    baseUrl,
    baseUrl[baseUrl.length - 1] !== '/' ? '/' : '',
    baseUrl.match(/\/api/) ? '' : 'api/',
    'v3/',
  ].join('');
}

export default getPowerAmpUrl;
