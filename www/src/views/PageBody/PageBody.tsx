/* eslint-disable react/jsx-props-no-spreading */
import AdUnder from './primitives/AdUnder';
import ContentMain from 'primitives/Layout/ContentMain';
import Footer from 'components/Footer';
import HeadingBackLink from 'components/HeadingBackLink';
import LiveLegalLinks from './LiveLegal';
import MainSection from './primitives/MainSection';
import PageWrapper from 'primitives/Layout/PageWrapper';
import RichResults from 'components/RichResults';
import RightRailAd from './RightRailAd';
import Section from 'primitives/Section';
import Social from 'components/Social';
import { BREAKPOINTS } from 'constants/responsive';
import { Props } from '.';

import { Heading, SectionHeading } from 'components/SectionHeading';
import {
  LeftSideBurnAdDiv,
  RightSideBurnAdDiv,
  TakeoverAdSlotContainer,
} from 'ads/components/AdSlotContainer';
import { MediaQueries } from 'components/MediaQueries';
import { Params } from 'components/RichResults/types';
import { SLOT_DIMENSIONS } from 'ads/constants';
import { TakeoverTypes } from 'ads/components/AdSlotContainer/types';
import { useCallback, useState } from 'react';
import type { SocialProps } from 'components/Social/types';

function PageBody({
  backLink,
  banner = null,
  children,
  dataTest,
  heading,
  headingButton = null,
  hideFooter,
  mainStyles = {},
  more = null,
  noAds,
  premiumBanner = null,
  richResultsMarkup,
  social = {} as SocialProps,
  title,
  wrappedContent = null,
  hasHero,
  personalizedPlaylist = null,
}: Props): JSX.Element {
  const hideRightSection = noAds && !more;
  const mainSectionType = hideRightSection ? 'full' : 'left';
  const headingBackLink =
    backLink ?
      <HeadingBackLink dataTest={`${dataTest}-back-link`} to={backLink}>
        {title}
      </HeadingBackLink>
    : null;
  const headingDefault = (
    <Heading as={hasHero ? 'h2' : 'h1'} data-test={`${dataTest}-page-heading`}>
      {title}
    </Heading>
  );

  const [showTakeover, setShowTakeover] = useState(false);
  const setEmpty = useCallback(() => setShowTakeover(false), [setShowTakeover]);
  const setPopulated = useCallback(
    () => setShowTakeover(true),
    [setShowTakeover],
  );

  // At this point TS has a hard time infering the markup based on the view, even though this is constrained on the <PageBody/> props
  // Coercing as RichResults Params because the typing on PageBody should ensure the proper meta for the type
  const markupProps = {
    meta: richResultsMarkup,
    type: dataTest,
  } as Params;
  const richResults =
    markupProps.meta ? <RichResults {...markupProps} /> : null;

  return (
    <>
      <ContentMain data-test={`${dataTest}-content-main`}>
        <MediaQueries maxWidths={[BREAKPOINTS.XLARGE]}>
          {([noSideBurns]: [boolean]) => {
            if (noSideBurns) {
              return null;
            } else {
              return (
                <>
                  <TakeoverAdSlotContainer
                    ccrpos="2003"
                    ContainerPrimitive={LeftSideBurnAdDiv}
                    dimensions={SLOT_DIMENSIONS.SIDEBURNS}
                    onEmpty={setEmpty}
                    onPopulated={setPopulated}
                    style={showTakeover ? {} : { width: 0 }}
                    takeoverType={TakeoverTypes.WallpaperLeft}
                  />
                  <TakeoverAdSlotContainer
                    ccrpos="2003"
                    ContainerPrimitive={RightSideBurnAdDiv}
                    dimensions={SLOT_DIMENSIONS.SIDEBURNS}
                    onEmpty={setEmpty}
                    onPopulated={setPopulated}
                    style={showTakeover ? {} : { width: 0 }}
                    takeoverType={TakeoverTypes.WallpaperRight}
                  />
                </>
              );
            }

            return null;
          }}
        </MediaQueries>
        {richResults}
        <PageWrapper data-test={`${dataTest}-page`} showTakeover={showTakeover}>
          <MainSection
            data-test={`${dataTest}-section-${mainSectionType}`}
            mainStyles={mainStyles}
            showTakeover={showTakeover}
            type={mainSectionType}
          >
            <div>{banner}</div>
            <div>{premiumBanner}</div>
            {personalizedPlaylist}
            {title || heading ?
              <Section data-test={`${dataTest}-section-top`} type="top">
                <SectionHeading data-test={`${dataTest}-section-heading`}>
                  {heading || headingBackLink || headingDefault}
                  {headingButton}
                  {social.url ?
                    <Social {...social} />
                  : null}
                </SectionHeading>
              </Section>
            : null}
            <Section data-test={`${dataTest}-body`} type="top">
              {children}
            </Section>
          </MainSection>
          {hideRightSection ? null : (
            <Section
              data-test={`${dataTest}-section-right`}
              hasWrappedContent={!!wrappedContent}
              type="right"
            >
              {noAds ? null : <RightRailAd />}
              <AdUnder data-test="ad-under">{more}</AdUnder>
            </Section>
          )}
          {wrappedContent}
          <LiveLegalLinks />
        </PageWrapper>
      </ContentMain>
      {hideFooter ? null : <Footer showTakeover={showTakeover} />}
    </>
  );
}

export default PageBody;
