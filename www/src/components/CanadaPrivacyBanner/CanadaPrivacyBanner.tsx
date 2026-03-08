import Banner from './primitives/Banner';
import BannerContainer from './primitives/BannerContainer';
import BannerLink from './primitives/BannerLink';
import Body from './primitives/Body';
import Button from './primitives/Button';
import ButtonText from './primitives/ButtonText';
import CloseButton from './primitives/CloseButton';
import CloseOutline from 'styles/icons/CloseOutline';
import ContentContainer from './primitives/ContentContainer';
import TextContainer from './primitives/TextContainer';
import Title from './primitives/Title';
import usePlayerState from 'contexts/PlayerState/usePlayerState';
import useTranslate from 'contexts/TranslateContext/useTranslate';
import { getWelcome } from 'state/Stations/selectors';
import { SET_CANADA_PRIVACY_STATUS } from 'state/Profile/constants';
import { updatePrivacyPreferences } from 'state/Profile/actions';
import { useDispatch, useSelector } from 'react-redux';
import type { Dispatch } from 'redux';
import type { Dispatch as ReactDispatch, SetStateAction } from 'react';

const setPrivacyCookie = (
  dispatch: Dispatch<{ type: typeof SET_CANADA_PRIVACY_STATUS }>,
) => {
  return dispatch({
    type: SET_CANADA_PRIVACY_STATUS,
    meta: {
      cookies: {
        set: {
          canadaPrivacyBanner: {
            value: String(Date.now()),
            config: {
              path: '/',
              secure: window.location.protocol.includes('https'),
            },
          },
        },
      },
    },
  });
};

export const CanadaPrivacyBanner = ({
  setShowBanner,
}: {
  setShowBanner: ReactDispatch<SetStateAction<boolean>>;
}) => {
  const translate = useTranslate();
  const isWelcomePage = useSelector(getWelcome);
  const playerState = usePlayerState();
  const isPlayerHidden = isWelcomePage || playerState === null;
  const dispatch = useDispatch();

  return (
    <BannerContainer
      css={{
        paddingBottom: isPlayerHidden ? '0' : '7.5rem',
      }}
    >
      <ContentContainer>
        <Banner>
          <TextContainer>
            <Title>{translate('We use cookies.')}</Title>
            <Body>
              {translate(
                'This website uses cookies for the purposes of enhancing the site, analyzing usage, and marketing, including contextual advertising. If you click “Accept All Cookies,” you also consent to the use of cookies and processing of your personal information by iHeartMedia and Bell Media to locate (e.g., IP address), identify (e.g., web activities), and profile (e.g., iHeartRadio use) you for the purpose of targeted advertising. {termsOfService}, {iHeartPolicy} and {bellPolicy}.',
                {
                  termsOfService: (
                    <BannerLink
                      href="https://www.iheart.com/content/terms-en-ca/"
                      rel="noreferrer"
                      target="_blank"
                    >
                      iHeartRadio Terms of Use
                    </BannerLink>
                  ),
                  iHeartPolicy: (
                    <BannerLink
                      href="https://www.iheart.com/content/privacy-en-ca/"
                      rel="noreferrer"
                      target="_blank"
                    >
                      iHeartRadio Privacy Policy
                    </BannerLink>
                  ),
                  bellPolicy: (
                    <BannerLink
                      href="http://support.bell.ca/Billing-and-Accounts/Security_and_privacy/How_does_Bell_respect_my_privacy"
                      rel="noreferrer"
                      target="_blank"
                    >
                      Bell Media Privacy Policy
                    </BannerLink>
                  ),
                },
              )}
            </Body>
          </TextContainer>
          <Button
            onClick={() => {
              dispatch(
                updatePrivacyPreferences({
                  complianceType: 'PPIPS',
                  requestType: 'OptIn',
                }),
              );
              setShowBanner(false);
              setPrivacyCookie(dispatch);
            }}
          >
            <ButtonText>{translate('Accept All Cookies')}</ButtonText>
          </Button>
          <CloseButton
            onClick={() => {
              setShowBanner(false);
              setPrivacyCookie(dispatch);
            }}
          >
            <CloseOutline />
          </CloseButton>
        </Banner>
      </ContentContainer>
    </BannerContainer>
  );
};
