import ContentMain from './primitives/ContentMain';
import Footer from 'components/Footer';
import Head from './Head';
import Hero from './Hero';
import PageWrapper from 'primitives/Layout/PageWrapper';
import Section from 'primitives/Section';
import UpgradeWrap from './primitives/UpgradeWrap';
import { BREAKPOINTS } from 'constants/responsive';
import { get } from 'lodash-es';
import { MediaQueries } from 'components/MediaQueries';

function RecurlyHOC({ children }: { children: any }) {
  return (
    <UpgradeWrap data-page="recurly">
      <Head />
      <MediaQueries maxWidths={[get(BREAKPOINTS, 'LARGE')]}>
        {([hideHero]: [boolean]) => (hideHero ? null : <Hero />)}
      </MediaQueries>
      <ContentMain>
        <PageWrapper marginValue="2rem">
          <Section omitMainStyles type="full">
            <div>{children}</div>
          </Section>
        </PageWrapper>
      </ContentMain>
      <Footer />
    </UpgradeWrap>
  );
}

export default RecurlyHOC;
