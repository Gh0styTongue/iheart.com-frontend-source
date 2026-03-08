import AdChoicesLogo from './primitives/AdChoicesLogo';
import Container from './primitives/Container';
import CopyrightLinks from './primitives/CopyrightLinks';
import CopyrightListItem from './primitives/CopyrightListItem';
import LinksContainer from './primitives/LinksContainer';
import NavLink from 'components/NavLink';
import PrivacyOptions from '../../styles/icons/PrivacyOptions';
import ShouldShow from 'components/ShouldShow';
import useTranslate from 'contexts/TranslateContext/useTranslate';
import Year from './primitives/Year';
import { adChoiceLogo } from 'constants/assets';

export type Props = {
  adChoicesLink: string;
  className?: string;
  helpLink: string;
  piiDashboardLink?: string;
  privacyLink: string;
  termsLink: string;
};

const Copyright = ({
  className,
  helpLink,
  piiDashboardLink,
  privacyLink,
  termsLink,
  adChoicesLink,
}: Props) => {
  const translate = useTranslate();

  return (
    <div>
      <Container className={className}>
        <Year>
          <p>
            {translate('© {fourDigitYear} iHeartMedia, Inc.', {
              fourDigitYear: new Date().getFullYear(),
            })}
          </p>
        </Year>
        <LinksContainer>
          <CopyrightLinks>
            <CopyrightListItem>
              <NavLink dataTest="help-link" target="_blank" to={helpLink}>
                {translate('Help')}
              </NavLink>
            </CopyrightListItem>
            <CopyrightListItem>
              <NavLink dataTest="privacy-link" target="_blank" to={privacyLink}>
                {translate('Privacy Policy')}
              </NavLink>
            </CopyrightListItem>
            <CopyrightListItem>
              <NavLink target="_blank" to={piiDashboardLink}>
                {translate('Your Privacy Choices')}
                <PrivacyOptions />
              </NavLink>
            </CopyrightListItem>
            <CopyrightListItem>
              <NavLink
                dataTest="termslink-container"
                target="_blank"
                to={termsLink}
              >
                {translate('Terms of Use')}
              </NavLink>
            </CopyrightListItem>
            <ShouldShow shouldShow={!!adChoicesLink}>
              <CopyrightListItem>
                <NavLink
                  dataTest="adchoices-link"
                  target="_blank"
                  to={adChoicesLink}
                >
                  AdChoices
                  <AdChoicesLogo alt="Ad Choices" src={adChoiceLogo} />
                </NavLink>
              </CopyrightListItem>
            </ShouldShow>
          </CopyrightLinks>
        </LinksContainer>
      </Container>
    </div>
  );
};

export default Copyright;
