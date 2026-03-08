import { PAGE_TYPE } from 'constants/pageType';

export function pageInfo() {
  return {
    ogTitle: '',
    pageType: PAGE_TYPE.MY_SONGS,
    targeting: {
      name: 'my_profile',
      modelId: 'my_songs',
    },
  };
}
