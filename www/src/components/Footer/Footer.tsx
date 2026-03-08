import FullFooter from './FullFooter';
import MiniFooter from './MiniFooter';

type Props = {
  miniFooter?: boolean;
  newFooter?: boolean;
  piiDashboardLink?: string;
  showTakeover?: boolean;
};

const Footer = ({
  miniFooter = false,
  newFooter,
  piiDashboardLink,
  showTakeover,
}: Props) => {
  if (miniFooter) {
    return <MiniFooter piiDashboardLink={piiDashboardLink} />;
  }
  return (
    <FullFooter
      newFooter={newFooter}
      piiDashboardLink={piiDashboardLink}
      showTakeover={showTakeover}
    />
  );
};

export default Footer;
