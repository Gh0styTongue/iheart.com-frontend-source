import logger from 'modules/Logger';
import { openSignupModal } from 'state/UI/actions';

import type { HighlightsConfig, ReduxDispatch } from './types';

/**
 * Handles loading and initialization of the Highlights SDK script.
 * Manages DNS optimization, script loading, SDK initialization, and authentication.
 */
export class SdkLoader {
  private isInitialized: boolean = false;

  private dispatch: ReduxDispatch | null = null;

  /**
   * Sets the Redux dispatch function for opening modals
   */
  public setDispatch(dispatch: ReduxDispatch): void {
    this.dispatch = dispatch;
  }

  /**
   * Adds a link tag to document head for DNS optimization.
   * Prevents duplicates by checking if link already exists.
   */
  private addLinkTag(href: string, rel: string): void {
    const existing = document.querySelector(
      `link[href="${href}"][rel="${rel}"]`,
    );
    if (!existing) {
      const link = document.createElement('link');
      link.rel = rel;
      link.href = href;
      document.head.append(link);
    }
  }

  /**
   * Adds DNS prefetch and preconnect tags for Highlights API and media domains.
   * This optimizes initial resource loading times.
   */
  public setupDNSOptimization(): void {
    this.addLinkTag('https://api.begenuin.com', 'dns-prefetch');
    this.addLinkTag('https://api.begenuin.com', 'preconnect');
    this.addLinkTag('https://media.begenuin.com', 'dns-prefetch');
    this.addLinkTag('https://media.begenuin.com', 'preconnect');
  }

  /**
   * Sets up the authentication callback for when user needs to login.
   * This is called by the Highlights SDK when authentication is required.
   */
  public setupAuthenticationCallback(): void {
    window.genuinAuth = (data: { returnQueryParams: string }) => {
      const params = new URLSearchParams(data.returnQueryParams);
      const action = params.get('action');

      if (this.dispatch) {
        const signupAction = openSignupModal({
          source: 'highlights_sdk',
          action: action || 'unknown',
          returnQueryParams: data.returnQueryParams,
        });

        this.dispatch(signupAction);
      } else {
        logger.warn(
          '[PlayerCoordinator] Redux dispatch not available for opening login modal',
          {},
        );
      }
    };
  }

  /**
   * Dynamically loads Highlights SDK script if not already present.
   * Prevents duplicate script injection.
   */
  public loadScript(scriptUrl: string, onLoad?: () => void): void {
    const scriptExists = document.querySelector('script[src*="gen_sdk"]');
    if (!scriptExists) {
      const script = document.createElement('script');
      script.src = scriptUrl;
      script.addEventListener('load', () => {
        if (onLoad) {
          onLoad();
        }
      });
      script.addEventListener('error', error => {
        logger.error('[PlayerCoordinator] Script failed to load:', error);
      });
      document.head.append(script);
    } else if (onLoad) {
      // Script already loaded, call callback immediately
      onLoad();
    }
  }

  /**
   * Initializes Highlights SDK with provided configuration.
   * Only initializes once - subsequent calls are ignored.
   */
  public initialize(
    config?: HighlightsConfig,
    onInitialize?: () => void,
  ): void {
    if (window.genuin && !this.isInitialized) {
      window.genuin.init(config);
      this.isInitialized = true;
      if (onInitialize) {
        onInitialize();
      }
    } else if (!window.genuin) {
      logger.error('[PlayerCoordinator] window.genuin is not available', {});
    } else if (this.isInitialized) {
      logger.warn('[PlayerCoordinator] Already initialized, skipping', {});
    }
  }

  /**
   * Checks if the SDK has been initialized
   */
  public getIsInitialized(): boolean {
    return this.isInitialized;
  }

  /**
   * Resets the initialization state
   */
  public reset(): void {
    this.isInitialized = false;
  }

  /**
   * Cleans up the authentication callback and dispatch reference
   */
  public cleanup(): void {
    if (window.genuinAuth) {
      delete window.genuinAuth;
    }
    this.dispatch = null;
  }
}
