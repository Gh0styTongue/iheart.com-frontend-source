import EVENTS from './constants/events';
import { Config, JWConfig } from './types/config';
import { Event } from './types/event';
import { JWErrorTypes } from './middleware/processErrors/constants';
import { JWPlayer, PlayerState } from './types/jwplayer';
import { memoize } from 'lodash-es';
import { PlaylistItem } from './types/playlist';
import { Subscription } from './types/subscription';
import { v4 as uuid } from 'uuid';

class Player {
  BLANK_MP4_URL?: string;

  JW_LICENSE_KEY?: string;

  JW_SCRIPT_URL?: string;

  PLAYER_ELEMENT?: string;

  jwconfig?: JWConfig;

  jwplayer?: JWPlayer;

  logger?: Config['logger'];

  // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
  middleware?: { [a in Event]: Array<Function> } | {};

  subscriptions?: Array<Subscription>;

  detached?: boolean = false;

  constructor({
    blankmp4url,
    jwlicensekey,
    jwscripturl,
    logger,
    middleware,
    playerelement,
    subscriptions,
    ...jwconfig
  }: Config) {
    if (!__CLIENT__) return;

    this.BLANK_MP4_URL = blankmp4url;
    this.JW_LICENSE_KEY = jwlicensekey;
    this.JW_SCRIPT_URL = jwscripturl;
    this.PLAYER_ELEMENT = `${playerelement || 'jw-player'}-${Date.now()}`;

    this.jwconfig = jwconfig;
    this.logger = logger || console;
    this.middleware = middleware || {};
    this.subscriptions = subscriptions || [];
    this._subscribeToErrors();

    const div = window.document.createElement('div');
    div.id = this.PLAYER_ELEMENT;
    window.document.querySelector('body')!.appendChild(div);
  }

  static create(config: Config): Player {
    return new Player(config);
  }

  _bindSubscriptions(): void {
    if (!this.subscriptions || !this.subscriptions.length) return;

    Object.keys(EVENTS).forEach(key => {
      const event = EVENTS[key as keyof typeof EVENTS];
      this.jwplayer!.on(event as Event, data =>
        this._runSubscriptions(event as Event, data),
      );
    });
  }

  _initializeJWPlayer = memoize(
    (): Promise<void> =>
      new Promise((resolve: () => void, reject: () => void) => {
        if (!__CLIENT__) {
          resolve();
          return;
        }

        const script = window.document.createElement('script');

        script.onload = () => {
          this.logger!.info(['PLAYER', 'SCRIPT_LOAD_SUCCESS'], {
            message: 'Success: JWPlayer script loaded successfully.',
          });
          // @ts-ignore
          window.jwplayer.key = this.JW_LICENSE_KEY;
          // @ts-ignore
          const jwplayer: JWPlayer = window.jwplayer(this.PLAYER_ELEMENT);
          this.jwplayer = jwplayer.setup({
            file: this.BLANK_MP4_URL,
            ...this.jwconfig!,
          });
          this._bindSubscriptions();
          this.jwplayer.on('ready', resolve);

          this.jwplayer.on('pause', pauseEvent => {
            const playlistItem = this.jwplayer?.getPlaylistItem(
              this.jwplayer?.getPlaylistIndex(),
            );

            if (
              playlistItem?.type === 'hls' &&
              pauseEvent.pauseReason === undefined
            ) {
              this.jwplayer?.detachMedia();
              this.detached = true;
            }
          });

          this.jwplayer.on('beforePlay', () => {
            if (this.detached) {
              this.jwplayer?.attachMedia();
              this.detached = false;
            }
          });
        };

        script.onerror = (error: any) => {
          this.logger!.error(['PLAYER', 'SCRIPT_LOAD_ERROR'], {
            error,
            message: 'Failure: JWPlayer script loaded unsuccessfully.',
          });
          const playerPrototypeKeys = Object.getOwnPropertyNames(
            Player.prototype,
          );
          const noops = playerPrototypeKeys.reduce(
            (acc, curr) => ({ ...acc, [curr]: () => {} }),
            {},
          );
          Object.setPrototypeOf(this, noops);
          reject();
        };

        script.src = this.JW_SCRIPT_URL!;

        window.document.querySelector('body')!.appendChild(script);
      }),
  );

  /**
   * IHRWEB-18138: _isInitialized wraps all jw player methods, but now only the first time a
   * player method is called will it return a promise. Also, all widget methods are now treated
   * as if they are synchronous in order to prevent autoplay errors.
   *
   * This introduces an edge-case race condition where a user on a bad connection triggers two
   * separate methods in quick succession and has those methods invoked out of order.
   *
   * If this becomes a real life bug, we should consider introducing a queue similar to the
   * Analytics module, ie `if (!this.jwplayer) this.enqueue(method);`
   */
  _isInitialized(cb: (...args: Array<any>) => any) {
    return !this.jwplayer ?
        async (...args: Array<any>): Promise<any> => {
          await this._initializeJWPlayer();
          return cb(...args);
        }
      : cb;
  }

  _runMiddleware(event: Event, data: any): any {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
    const middleware = (this.middleware as { [a in Event]: Array<Function> })[
      event
    ];

    if (!middleware || !middleware.length) return data;

    return middleware.reduce((acc, curr) => {
      if (typeof curr !== 'function') {
        this.logger!.error(['PLAYER', 'RUN_MIDDLEWARE'], {
          message: 'The provided middleware must be a function.',
          middleware: curr,
        });
        return acc;
      }
      return curr(acc, event, this.jwplayer?.trigger?.bind(this.jwplayer));
    }, data);
  }

  _runSubscriptions(event: Event, data: any): void {
    if (!this.subscriptions || !this.subscriptions.length) return;

    this.subscriptions.forEach(subscription => {
      const handler = subscription[event];
      if (!handler || typeof handler !== 'function') return;
      handler(this._runMiddleware(event, data) as never);
    });
  }

  _subscribeToErrors(): void {
    Object.values(JWErrorTypes).forEach(errorType =>
      this.subscribe({ [errorType]: () => {} }),
    );
  }

  subscribe(subscription: Subscription): () => void {
    const id = uuid();

    this.subscriptions = [...this.subscriptions!, { ...subscription, id }];

    return () => {
      this.subscriptions = this.subscriptions!.filter(s => s.id !== id);
    };
  }

  getIsMuted = this._isInitialized((): boolean => this.jwplayer!.getMute());

  getLoop = this._isInitialized(
    (): boolean => this.jwplayer!.getConfig().repeat,
  );

  getPlayerState = this._isInitialized(
    (): PlayerState => this.jwplayer!.getState(),
  );

  getPosition = this._isInitialized((): number => this.jwplayer!.getPosition());

  getState = this._isInitialized(() => this.jwplayer!.getState());

  getVolume = this._isInitialized((): number => this.jwplayer!.getVolume());

  load = this._isInitialized((playlist: Array<PlaylistItem>): void =>
    this.jwplayer!.load(playlist),
  );

  mute = this._isInitialized((): void => this.jwplayer!.setMute(true));

  pause = this._isInitialized((): void => this.jwplayer!.pause());

  play = this._isInitialized((): void => this.jwplayer!.play());

  seek = this._isInitialized((position: number): void =>
    this.jwplayer!.seek(position),
  );

  setLoop = this._isInitialized((repeat: boolean): void =>
    this.jwplayer!.setConfig({ repeat }),
  );

  setVolume = this._isInitialized((volume: number): void =>
    this.jwplayer!.setVolume(volume),
  );

  stop = this._isInitialized((): void => this.jwplayer!.stop());

  unmute = this._isInitialized((): void => this.jwplayer!.setMute(false));

  getPlaybackRate = this._isInitialized((): number =>
    this.jwplayer!.getPlaybackRate(),
  );

  setPlaybackRate = this._isInitialized((rate: number): void =>
    this.jwplayer!.setPlaybackRate(rate),
  );
}

export default Player;
