import { PAGE_TYPE } from 'constants/pageType';

export function pageInfo() {
  return {
    ogTitle: '',
    pageName: 'update-payment-info',
    pageType: PAGE_TYPE.UPDATE_PAYMENT,
    targeting: {
      name: 'update_payment',
      modelId: 'update_payment',
    },
    title: 'Update Payment Info',
  };
}
