import hub, { E } from 'shared/utils/Hub';
import qs from 'qs';
import UPSELL from 'constants/upsellTracking';
import { Component } from 'react';
import { ON_DEMAND_SUBSCRIPTION_ID } from 'constants/subscriptionConstants';
import { parse } from 'url';

const plusSubscriptionIds = [
  ON_DEMAND_SUBSCRIPTION_ID.IHEART_US_PLUS,
  ON_DEMAND_SUBSCRIPTION_ID.IHEART_US_PLUS_TRIAL,
];

// WEB-8410 We redirect on the client side to maintain compatability with iOS universal links,
// which do not work when you are issuing HTTP redirects (3xx) server side.
export default class Redirect extends Component {
  static propTypes = {
    navigate: PropTypes.func.isRequired,
    search: PropTypes.string.isRequired,
  };

  componentDidMount() {
    const { search } = this.props;
    const { u, ...remainder } = qs.parse(search.replace('?', ''));
    const url = u ? decodeURIComponent(u) : window.location.origin;

    // check redirect is to iheart.com
    const parsed = parse(url);
    const isValidRedirect =
      !!parsed.host && parsed.host.match(/.*iheart\.com$/gi);

    // if we are not redirecting to iheart anything, halt and bail back to main page
    if (!isValidRedirect) {
      this.navigateLater({ path: '/' });
    } else {
      // check userId if query param is set
      // if true redirect
      // if not true, clear the cookie first
      const redirectQuery = parsed.query ? qs.parse(parsed.query) : {};
      if (redirectQuery && redirectQuery.subscriptionId) {
        const { subscriptionId } = redirectQuery;
        if (plusSubscriptionIds.includes(subscriptionId)) {
          redirectQuery.upsellFrom = UPSELL.EMAIL_RESET_PASSWORD_PLUS.id;
        } else {
          redirectQuery.upsellFrom = UPSELL.EMAIL_RESET_PASSWORD_PREMIUM.id;
        }
      }
      const parsedQuery = `${qs.stringify({ ...redirectQuery, ...remainder })}`;
      this.navigateLater({ path: `${parsed.pathname}?${parsedQuery}` });
    }
  }

  navigateLater(opts) {
    hub.once(E.PAGE_RENDERED, () => this.props.navigate(opts));
  }

  render() {
    return null;
  }
}
