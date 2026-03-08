import Button from './primitives/Button';
import CallOut from './primitives/CallOut';
import CloseButton from './primitives/CloseButton';
import CloseIcon from 'styles/icons/CloseIcon';
import getTheApp from 'utils/getTheApp';
import hub, { E } from 'shared/utils/Hub';
import ListenInAppPrimitive from './primitives/ListenInApp';
import ListenInWrapper from './primitives/ListenInWrapper';
import Logo from './primitives/Logo';
import SubHeadline from './primitives/SubHeadline';
import useMount from 'hooks/useMount';
import useTheme from 'contexts/Theme/useTheme';
import { blankLogoTile } from 'constants/assets';
import { getCollectionImageUrl } from 'state/Playlist/helpers';
import { getIsListenInAppVisible } from 'state/UI/selectors';
import { getIsMobile } from 'state/Environment/selectors';
import { getMediaServerUrl, getSiteUrl } from 'state/Config/selectors';
import { getScaledImageUrlById } from 'utils/url';
import { setIsListenInAppVisible } from 'state/UI/actions';
import { useDispatch, useSelector } from 'react-redux';
import { useState } from 'react';
import type { FunctionComponent } from 'react';

type Props = {
  imageUrl?: string;
  seedId: number | string;
  seedType: string;
};

const ListenInApp: FunctionComponent<Props> = ({
  imageUrl,
  seedId,
  seedType,
}) => {
  const [shouldAnimate, setShouldAnimate] = useState(false);
  const isMobile = useSelector(getIsMobile);
  const theme = useTheme();
  const dispatch = useDispatch();
  const isVisible = useSelector(getIsListenInAppVisible);
  const mediaServerUrl = useSelector(getMediaServerUrl);
  const siteUrl = useSelector(getSiteUrl);

  const setIsVisible = (visible: boolean) =>
    dispatch(setIsListenInAppVisible(visible));

  const bounceBanner = () => {
    // Don't animate if already animating
    if (!shouldAnimate) {
      setShouldAnimate(true);
      // remove class after animation
      setTimeout(() => setShouldAnimate(false), 550);
    }
  };

  const showOrBounceBanner = () => {
    if (isVisible) {
      bounceBanner();
    } else {
      setIsVisible(isMobile);
    }
  };

  const getLogoCSS = () => {
    let iconUrl;

    // attempt to load station / artist img etc
    if (imageUrl) {
      iconUrl = getCollectionImageUrl(
        { mediaServerUrl, siteUrl },
        { width: 38 },
        imageUrl,
      );
    } else if (seedId && seedType) {
      iconUrl = getScaledImageUrlById(seedId, seedType, 38, 38);
    }
    if (iconUrl) {
      return {
        backgroundImage: `url("${iconUrl}"), url("${blankLogoTile}")`,
      };
    }

    return undefined;
  };

  useMount(() => {
    if (isMobile) {
      hub.on(E.CREATE_RADIO, () => showOrBounceBanner());
    }

    return () => {
      hub.off(E.CREATE_RADIO, () => showOrBounceBanner());
    };
  });

  if (!(isVisible && isMobile)) return null;

  return (
    <ListenInAppPrimitive data-test="listen-in-app-banner">
      <ListenInWrapper bounceAnimation={shouldAnimate}>
        <CloseButton onClick={() => setIsVisible(false)}>
          <CloseIcon fill={theme.colors.white.primary} height="12" width="12" />
        </CloseButton>
        <Logo css={getLogoCSS()} />
        <CallOut>
          <div style={{ fontSize: '1.2rem' }}>Listen on the free</div>
          <SubHeadline>iHeart App</SubHeadline>
        </CallOut>
        <Button onClick={getTheApp} type="button">
          Get The App
        </Button>
      </ListenInWrapper>
    </ListenInAppPrimitive>
  );
};

export default ListenInApp;
