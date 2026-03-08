import * as React from 'react';
import ChevronArrow from 'styles/icons/ChevronArrow';
import NavLink from 'components/NavLink';
import SectionHeader from 'primitives/Typography/Headings/SectionHeader';
import Subheading from 'primitives/Typography/Headings/Subheading';
import TemplateSection from './primitives/TemplateSection';
import { Component } from 'react';
import type { ReactNode } from 'react';

type Props = {
  appendEmpty?: boolean;
  as?: React.ElementType;
  emptyMessage?: ReactNode;
  dataTest?: string;
  hasBorder?: boolean;
  hasMobileBottomLink?: boolean;
  hasExtraPadding?: boolean;
  header?: ReactNode;
  isEmpty?: boolean;
  isHidden?: boolean;
  fullWidth?: boolean;
  onHeaderClick?: () => void;
  subheader?: string;
  suppressFirstOfType?: boolean;
  url?: string;
};

class Section extends Component<Props> {
  static defaultProps = {
    appendEmpty: false,
    emptyMessage: '',
    fullWidth: false,
    hasBorder: false,
    hasExtraPadding: true,
    hasMobileBottomLink: false,
    header: undefined,
    isEmpty: false,
    isHidden: false,
    onHeaderClick: undefined,
    subheader: '',
    suppressFirstOfType: false,
    url: '',
  };

  onHeaderClick = () => {
    // If the onHeaderClick prop was passed into this component, and it's a function, execute it!
    if (
      this.props.onHeaderClick &&
      typeof this.props.onHeaderClick === 'function'
    ) {
      this.props.onHeaderClick();
    }
    return true;
  };

  render() {
    const {
      as = 'h3',
      dataTest,
      hasBorder,
      hasExtraPadding,
      hasMobileBottomLink,
      suppressFirstOfType,
    } = this.props;
    let { children } = this.props;
    let emptyBlock = null;
    let header;
    let subheader;

    if (
      this.props.isEmpty &&
      this.props.emptyMessage &&
      this.props.appendEmpty
    ) {
      emptyBlock = <span>{this.props.emptyMessage}</span>;
    } else if (
      this.props.isEmpty &&
      this.props.emptyMessage &&
      !this.props.appendEmpty
    ) {
      children = this.props.emptyMessage;
    }

    if (this.props.header) {
      if (typeof this.props.header === 'string') {
        if (this.props.url) {
          header = (
            <SectionHeader as={as}>
              <NavLink
                dataTest="section-header"
                onClick={this.onHeaderClick}
                supressDeepLink
                to={this.props.url}
              >
                {this.props.header}{' '}
                <ChevronArrow css={{ margin: '0 0 -2px 0' }} />
              </NavLink>
            </SectionHeader>
          );
        } else {
          header = (
            <SectionHeader as={as} data-test="section-header">
              {this.props.header}
            </SectionHeader>
          );
        }
      } else {
        header = this.props.header;
      }
    }

    if (this.props.subheader) {
      subheader = <Subheading>{this.props.subheader}</Subheading>;
    }

    return this.props.isHidden ?
        null
      : <TemplateSection
          data-test={dataTest}
          fullWidth={this.props.fullWidth}
          hasBorder={hasBorder}
          hasExtraPadding={hasExtraPadding}
          hasMobileBottomLink={hasMobileBottomLink}
          suppressFirstOfType={suppressFirstOfType}
        >
          {header}
          {subheader}
          {children}
          {emptyBlock}
        </TemplateSection>;
  }
}

export default Section;
