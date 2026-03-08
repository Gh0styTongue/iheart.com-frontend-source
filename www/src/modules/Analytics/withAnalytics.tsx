import analytics, { Events } from './index';
import getStore from 'state/factory';
import hoistStatics from 'hoist-non-react-statics';
import trackers from 'trackers';
import type { ComponentType } from 'react';
import type { ViewWithStatics } from 'views/ViewWithStatics';

type Lifecycle<Props> = boolean | ((...args: Array<Props>) => boolean);

type Options<Props> = {
  trackOnDidUpdate?: Lifecycle<Props>;
  trackOnWillMount?: Lifecycle<Props>;
};

function withAnalytics<Props>(
  data: any | ((a: Props | null | undefined) => any),
  { trackOnDidUpdate = false, trackOnWillMount = true }: Options<Props> = {},
) {
  return function withAnalyticsThunk(
    Component: ViewWithStatics,
  ): ComponentType<Props> {
    class Analytics extends React.Component<Props> {
      static displayName = `withAnalytics(${String(
        Component.displayName || Component.name,
      )})`;

      constructor(props: Props) {
        super(props);

        if (!this.shouldTrack(trackOnWillMount, props)) return;
        this.track(props);
      }

      componentDidUpdate(prevProps: Props): void {
        if (!this.shouldTrack(trackOnDidUpdate, prevProps, this.props)) return;
        this.track(this.props);
      }

      shouldTrack(lifecycle: Lifecycle<Props>, ...rest: Array<Props>): boolean {
        return (
          __CLIENT__ &&
          !!(typeof lifecycle === 'function' ? lifecycle(...rest) : lifecycle)
        );
      }

      track(props: Props): void {
        const trackingDataFromProps =
          typeof data === 'function' ? data(props) : (data ?? {});
        const pageInfo =
          Component.pageInfo ? Component.pageInfo(getStore().getState()) : {};
        const trackingData = { ...pageInfo, ...trackingDataFromProps };

        analytics?.trackPageView?.(trackingData);
        trackers.track(Events.PageView, trackingData);
      }

      render() {
        return <Component {...this.props} />;
      }
    }

    return hoistStatics(Analytics, Component);
  };
}

export default withAnalytics;
