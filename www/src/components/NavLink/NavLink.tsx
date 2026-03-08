import * as React from 'react';
import analytics from 'modules/Analytics';
import classnames from 'classnames';
import hub, { E } from 'shared/utils/Hub';
import LinkButton from 'primitives/Buttons/LinkButton';
import url from 'url';
import { Component, MouseEvent, ReactNode } from 'react';
import { Data as ItemSelectedData } from 'modules/Analytics/helpers/itemSelected';
import { Location } from 'history';
import { match } from 'react-router';
import { Navigate } from 'state/Routing/types';
import { NavLink } from 'react-router-dom';

export type Props = {
  activeClassName?: string;
  as?: React.ElementType;
  css?: any;
  children: ReactNode;
  classes?: Array<string>;
  className?: string;
  dataTest: string;
  exact?: boolean;
  forceLegacy?: boolean;
  isActive?: <Params extends { [K in keyof Params]?: string }>(
    matched: match<Params>,
    location: Location,
  ) => boolean;
  isInApp: boolean;
  itemProp?: string;
  itemSelected?: ItemSelectedData;
  clickedFrom?: string;
  navigate: Navigate;
  onClick?: (
    event: MouseEvent<HTMLAnchorElement> | MouseEvent<HTMLButtonElement>,
  ) => boolean;
  siteUrl: string;
  supressDeepLink?: boolean;
  target?: '_blank' | '_parent' | '_self' | '_top';
  title?: string;
  to?: string;
  underline?: boolean;
  role?: string;
};

class CustomLink extends Component<Props> {
  static defaultProps = {
    classes: [],
    dataTest: 'nav-link',
    forceLegacy: false,
    to: '',
  };

  onClick = (
    event: MouseEvent<HTMLAnchorElement> | MouseEvent<HTMLButtonElement>,
  ): void => {
    const { to, target, forceLegacy, navigate, onClick, ...props } = this.props;

    if (props.itemSelected) {
      analytics.trackItemSelected!(props.itemSelected);
    }

    if (props.clickedFrom) {
      analytics.trackClick!(props.clickedFrom);
    }

    if (onClick && !onClick(event)) {
      event.preventDefault();
      return;
    }

    if (target !== '_blank') {
      if (forceLegacy && to) {
        navigate({ path: to });
      } else {
        hub.trigger(E.NAVIGATE, to);
      }
    }
  };

  render() {
    const {
      as,
      css,
      className,
      to,
      dataTest,
      children,
      target,
      title,
      classes = [],
      exact,
      supressDeepLink,
      isActive,
      activeClassName,
      itemProp,
      forceLegacy,
      isInApp,
      onClick,
      siteUrl,
      underline = false,
      role,
    } = this.props;

    const classesToApply = classnames(className, ...classes) || undefined;

    if (!to) {
      return (
        <LinkButton
          // default to span if no "to" or "onClick" attributes. This element is not interactive, so it doesn't need to be a <button/>
          as={as ?? (onClick ? undefined : 'span')}
          className={classesToApply}
          css={{ css }}
          data-test={dataTest}
          onClick={this.onClick}
          role={role}
          title={title}
          underline={underline}
        >
          {children}
        </LinkButton>
      );
    }

    const parsedUrl = url.parse(to);

    if (isInApp && !supressDeepLink) {
      const href = parsedUrl.hostname ? to : `https://www.iheart.com${to}`;

      return (
        <a
          className={classesToApply}
          css={css}
          data-test={dataTest}
          href={href}
          itemProp={itemProp}
          onClick={this.onClick}
          rel="noopener noreferrer"
          role={role}
          target="_blank"
          title={title}
        >
          {children}
        </a>
      );
    }

    const currentHost = url.parse(siteUrl).host || '';

    // we check if a protocol is present, because navlink only handles relative routes
    const outerLink =
      parsedUrl.protocol &&
      parsedUrl.href!.split('?')[0].indexOf(currentHost) === -1 &&
      parsedUrl.host !== 'www.iheart.com';

    if (target === '_blank' || outerLink || forceLegacy) {
      return (
        <a
          className={classesToApply}
          css={css}
          data-test={dataTest}
          href={forceLegacy ? undefined : to}
          itemProp={itemProp}
          onClick={this.onClick}
          rel="noreferrer"
          role={role}
          target={outerLink ? '_blank' : target}
          title={title}
        >
          {children}
        </a>
      );
    }

    const href = parsedUrl.host ? parsedUrl.path : to;

    return (
      <NavLink
        activeClassName={activeClassName}
        className={classesToApply}
        css={css}
        data-test={dataTest}
        exact={exact}
        isActive={isActive}
        itemProp={itemProp}
        onClick={this.onClick}
        role={role}
        target={target}
        title={title}
        to={href || ''}
      >
        {children}
      </NavLink>
    );
  }
}

export default CustomLink;
