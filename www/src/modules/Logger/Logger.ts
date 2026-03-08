import localStorage from 'utils/localStorage';
import LocalStorageKeys from 'constants/localStorageKeys';
import {
  Config,
  Filter,
  Log,
  StoredRegex,
  Subscription,
  SubscriptionObject,
  Transform,
  Type,
} from './types';

export const ERROR = 'ERROR';
export const INFO = 'INFO';
export const WARN = 'WARN';

const LOGGER_CONTEXT = 'LOGGER';
const DEFAULT_FILTER = /.*/;

class Logger {
  enabled: boolean;

  filter: Filter;

  transforms: Array<Transform>;

  namespace: Array<string>;

  subscriptions: Array<Subscription>;

  error: (
    context: string | Array<string>,
    data: any,
    meta?: Log['meta'],
    error?: Error,
  ) => void;

  info: (
    context: string | Array<string>,
    data: any,
    meta?: Log['meta'],
  ) => void;

  warn: (
    context: string | Array<string>,
    data: any,
    meta?: Log['meta'],
  ) => void;

  static create(config: Config): Logger {
    return new Logger(config);
  }

  static staticLog(
    namespace: Array<string>,
    type: Type,
    context: Array<string>,
    data: any,
    meta?: Log['meta'],
  ): Log {
    const { stack } = data instanceof Error ? data : new Error();
    return {
      context,
      data,
      meta,
      namespace,
      time: new Date().toISOString(),
      type,
      ...(type === ERROR ?
        {
          trace:
            stack ??
            ''
              .split('\n')
              .slice(1)
              .map((line: string) => line.trim()),
        }
      : {}),
    };
  }

  constructor({ transforms, namespace, subscriptions }: Config) {
    this.enabled = this.getLocalStorage();
    this.filter = this.retrieveInitialFilter();
    this.transforms = transforms || [];
    this.namespace = namespace || [];
    this.subscriptions = subscriptions || [];
    this.setLocalStorage(this.enabled);

    this.error = this.log.bind(this, ERROR);
    this.info = this.log.bind(this, INFO);
    this.warn = this.log.bind(this, WARN);
  }

  clone({ transforms = [], namespace = [], subscriptions = [] }: Config) {
    return Logger.create({
      namespace: [...this.namespace, ...namespace],
      subscriptions: [...this.subscriptions, ...subscriptions],
      transforms: [...this.transforms, ...transforms],
    });
  }

  createLog(
    type: Type,
    context: Array<string>,
    data: any,
    meta?: Log['meta'],
  ): Log {
    try {
      throw new Error();
    } catch (e: any) {
      return {
        context,
        data,
        meta,
        namespace: this.namespace,
        time: new Date().toISOString(),
        trace: e.stack
          .split('\n')
          .slice(1)
          .map((line: string) => line.trim()),
        type,
      };
    }
  }

  propagateOrCreateLog(
    type: Type,
    context: Array<string>,
    data: any,
    meta?: Log['meta'],
    error?: Error | any,
  ): Log {
    if (error instanceof Error && error !== undefined) {
      return {
        context,
        data,
        meta,
        namespace: this.namespace,
        time: new Date().toISOString(),
        trace: error?.stack
          ?.split('\n')
          .slice(1)
          .map((line: string) => line.trim()) ?? [''],
        type,
      };
    } else {
      return this.createLog(type, context, data, meta);
    }
  }

  disable(): void {
    this.enabled = false;
    this.setLocalStorage(false);
  }

  enable(): void {
    this.enabled = true;
    this.setLocalStorage(true);
  }

  getLocalStorage(): boolean {
    if (typeof window === 'undefined') return true;
    return localStorage.getItem<boolean>(LocalStorageKeys.LoggerEnabled, false);
  }

  log(
    type: Type,
    context: string | Array<string>,
    data: any,
    meta?: Log['meta'],
    error?: Error,
  ): void {
    const contextList = (Array.isArray(context) ? context : [context]).filter(
      Boolean,
    );

    if (contextList.length) {
      this.runSubscriptions(
        this.runTransforms(
          this.propagateOrCreateLog(type, contextList, data, meta, error),
        ),
      );
    } else {
      this.error(LOGGER_CONTEXT, {
        context,
        message: 'Please pass in a valid context as your first argument.',
      });
    }
  }

  runTransforms(log: Log): Log {
    if (!this.transforms.length) return log;

    return this.transforms.reduce((acc: Log, curr: Transform): Log => {
      if (typeof curr === 'function') return { ...acc, ...curr(acc) };
      if (curr.onError && log.type === ERROR)
        return { ...acc, ...curr.onError(acc) };
      if (curr.onInfo && log.type === INFO)
        return { ...acc, ...curr.onInfo(acc) };
      if (curr.onWarn && log.type === WARN)
        return { ...acc, ...curr.onWarn(acc) };
      return acc;
    }, log);
  }

  runSubscriptions(log: Log): void {
    if (!this.subscriptions.length) return;

    this.subscriptions.forEach((subscription: Subscription): void => {
      if (
        (subscription as SubscriptionObject).shouldLog &&
        !(subscription as SubscriptionObject).shouldLog!(
          log,
          this.enabled,
          this.filter,
        )
      )
        return;
      if (typeof subscription === 'function') subscription(log);
      if ((subscription as SubscriptionObject).onError && log.type === ERROR)
        (subscription as SubscriptionObject).onError!(log);
      if ((subscription as SubscriptionObject).onInfo && log.type === INFO)
        (subscription as SubscriptionObject).onInfo!(log);
      if ((subscription as SubscriptionObject).onWarn && log.type === WARN)
        (subscription as SubscriptionObject).onWarn!(log);
    });
  }

  setFilter(filter: Filter, save?: boolean): void {
    if (!this.enabled || !filter) return;
    if (typeof filter !== 'string' && !(filter instanceof RegExp)) return;
    if (save) {
      this.saveFilter(filter);
    }
    this.filter = filter;
  }

  resetFilter(clearSaved?: boolean): void {
    if (clearSaved) localStorage.removeItem(LocalStorageKeys.LoggerFilter);
    this.filter = DEFAULT_FILTER;
  }

  retrieveInitialFilter(): Filter {
    const filter = localStorage.getItem<string | null | StoredRegex>(
      LocalStorageKeys.LoggerFilter,
      null,
    );

    if (typeof filter === 'object' && filter?.regex) {
      return new RegExp(filter.regex, filter.searchType);
    }

    if (typeof filter === 'string') {
      return filter;
    }

    return DEFAULT_FILTER;
  }

  saveFilter(filter: Filter) {
    if (typeof filter === 'string') {
      localStorage.setItem(LocalStorageKeys.LoggerFilter, filter);
      return;
    }

    if (filter instanceof RegExp) {
      // Split stringified regex (/foo/g) into ["foo", "g"]
      const [regex, searchType] = `${filter}`.match(/(?!\/)[\w\d]+/g) as [
        string,
        string | undefined,
      ];

      localStorage.setItem(LocalStorageKeys.LoggerFilter, {
        regex,
        searchType,
      });
    }
  }

  setLocalStorage(enabled: boolean): void {
    localStorage.setItem(LocalStorageKeys.LoggerEnabled, enabled);
  }
}

export default Logger;
