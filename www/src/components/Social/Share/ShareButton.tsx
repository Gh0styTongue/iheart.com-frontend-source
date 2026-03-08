import BareButton from 'primitives/Buttons/BareButton';
import Body2 from 'primitives/Typography/BodyCopy/Body2';
import MobileShareBtn from './primitives/MobileShareBtn';
import OutlinedButton from 'primitives/Buttons/OutlinedButton';
import Share from 'styles/icons/Share';
import ShareBtn from './primitives/ShareBtn';
import ShareDropdown from './primitives/ShareDropdown';
import ShareDropdownContainer from './primitives/ShareDropdownContainer';
import SocialLabel from '../primitives/SocialLabel';
import theme from 'styles/themes/default';
import trackers from 'trackers';
import useTranslate from 'contexts/TranslateContext/useTranslate';
import { ConnectedModals } from 'state/UI/constants';
import { Events } from 'modules/Analytics';
import { openModal } from 'state/UI/actions';
import { ShareTypes } from './constants';
import { useDispatch } from 'react-redux';
import type { FunctionComponent } from 'react';
import type { WidgetDimensions } from 'constants/widgetDimensions';

type Props = {
  description?: string;
  dimensions?: { height: number; width: number } | WidgetDimensions;
  disabled?: boolean;
  episodeId?: number;
  genreLogo?: string;
  hideDescription?: boolean;
  model?: Record<string, any>;
  onAfterClick?: () => void;
  onBeforeClick?: () => void;
  seedId?: number | string;
  seedType?: string;
  stationName?: string;
  type: ShareTypes;
  url?: string | null;
};

const ShareButton: FunctionComponent<Props> = ({
  description,
  dimensions,
  disabled = false,
  episodeId,
  genreLogo,
  hideDescription,
  model,
  onAfterClick = () => {},
  onBeforeClick = () => {},
  seedId,
  seedType,
  stationName,
  url,
  type,
}) => {
  const translate = useTranslate();
  const dispatch = useDispatch();

  const onClick = () => {
    onBeforeClick();
    trackers.track(Events.Share, { seedType, seedId, stationName, episodeId });

    dispatch(
      openModal({
        id: ConnectedModals.Share,
        context: {
          seedType: seedType!,
          seedId: seedId!,
          episodeId,
          url,
          model: model?.toJSON() ?? model,
          stationName,
          hideDescription,
          description,
          genreLogo,
          dimensions,
        },
      }),
    );

    onAfterClick();

    return !disabled;
  };

  if (type === ShareTypes.Link) {
    return (
      <a data-test="share-button" onClick={onClick}>
        {translate('Share')}
        {seedType === 'track' ? translate(' Song') : null}
      </a>
    );
  }
  if (type === ShareTypes.Dropdown) {
    return (
      <ShareDropdownContainer>
        <ShareDropdown>
          <a onClick={onClick} title={translate('Share')}>
            {translate('Share')}
          </a>
        </ShareDropdown>
        <MobileShareBtn>
          <a onClick={onClick}>
            <Share
              color={theme.colors.gray.medium}
              css={{ margin: '0 0 -.2rem 1rem' }}
            />
          </a>
        </MobileShareBtn>
      </ShareDropdownContainer>
    );
  }
  if (type === ShareTypes.OutlinedButton) {
    return (
      <OutlinedButton onClick={onClick}>
        <Share />
        <Body2>{translate('Share')}</Body2>
      </OutlinedButton>
    );
  }
  if (type === ShareTypes.BareButton) {
    return (
      <BareButton data-test="share-button" onClick={onClick} underline>
        <Share />
        <Body2>{translate('Share')}</Body2>
      </BareButton>
    );
  }

  if (type === ShareTypes.IconOnly) {
    return (
      <Share
        color={theme.colors.white.primary}
        height="22"
        onClick={onClick}
        width="22"
      />
    );
  }

  return (
    <ShareBtn data-test="share-button" onClick={onClick}>
      <Share
        color={theme.colors.gray.medium}
        css={{ marginBottom: '-.2rem' }}
        height="18"
      />
      <SocialLabel data-test="social-label">{translate('Share')}</SocialLabel>
    </ShareBtn>
  );
};

export default ShareButton;
