import Copyright from './primitives/Copyright';
import FooterWrap from './primitives/MiniFooterWrap';

type Props = {
  help: string;
  piiDashboardLink?: string;
  privacy: string;
  terms: string;
};

const MiniFooter = ({ help, piiDashboardLink, privacy, terms }: Props) => (
  <FooterWrap>
    <Copyright
      helpLink={help}
      piiDashboardLink={piiDashboardLink}
      privacyLink={privacy}
      termsLink={terms}
    />
  </FooterWrap>
);

export default MiniFooter;
