import Check from 'styles/icons/Check';
import CheckCircle from 'styles/icons/CheckCircle';
import Close from 'styles/icons/Close';
import CloseIcon from 'styles/icons/CloseIcon';
import Deleted from 'styles/icons/Deleted';
import GrowlContainer from './primitives/GrowlContainer';
import GrowlDescription from './primitives/GrowlDescription';
import GrowlHeader from './primitives/GrowlHeader';
import GrowlTitle from './primitives/GrowlTitle';
import HeartFilled from 'styles/icons/HeartFilled';
import InfoIcon from 'styles/icons/InfoIcon';
import useMount from 'hooks/useMount';
import { GrowlIcons } from './constants';
import { hideGrowl } from 'state/UI/actions';
import { useCallback, useState } from 'react';
import { useDispatch } from 'react-redux';
import type { FunctionComponent, ReactNode } from 'react';
import type { GrowlObject } from './types';

type Props = {
  growl: GrowlObject;
  'data-test'?: string;
};

const FADE_IN_TIME = 200;
const FADE_OUT_TIME = 500;
const CLOSE_DELAY = 2_500;

const icons: { [key in GrowlIcons]: ReactNode } = {
  [GrowlIcons.Check]: (
    <Check
      color="white"
      data-test="growl-icon-check"
      key="icon"
      type="filled"
    />
  ),
  [GrowlIcons.CheckCircle]: (
    <CheckCircle css={{ marginTop: '.3rem' }} key="icon" />
  ),
  [GrowlIcons.Close]: <Close key="icon" />,
  [GrowlIcons.Info]: <InfoIcon key="icon" />,
  [GrowlIcons.Deleted]: <Deleted fill="white" key="icon" stroke="white" />,
  [GrowlIcons.HeartFilled]: (
    <HeartFilled fill="white" key="icon" stroke="white" />
  ),
};

const Growl: FunctionComponent<Props> = ({ 'data-test': dataTest, growl }) => {
  const dispatch = useDispatch();
  const [opacity, setOpacity] = useState(0);
  const [fadeTime, setFadeTime] = useState(FADE_IN_TIME);

  const hide = useCallback((delay = 0) => {
    const fadeTimeout = setTimeout(() => {
      setOpacity(0);
      setFadeTime(FADE_OUT_TIME);
    }, delay);

    const hideTimeout = setTimeout(() => {
      dispatch(hideGrowl(growl.id));
    }, delay + FADE_OUT_TIME);

    return function cleanup() {
      clearTimeout(fadeTimeout);
      clearTimeout(hideTimeout);
    };
  }, []);

  useMount(() => {
    setOpacity(1);
    if (growl.sticky) return undefined;

    const cleanup = hide(CLOSE_DELAY);
    return cleanup;
  });

  // It would appear sticky is still used, but the layout looks dumb. Can probably remove later in the epic.
  const closeButton =
    growl.sticky ?
      <CloseIcon
        css={theme => ({
          cursor: 'pointer',
          fill: theme.colors.white.primary,
          marginRight: 0,
          marginLeft: '1rem',
          position: 'relative',
          left: '1rem',
        })}
        data-test="growl-close-icon"
        height="2.4rem"
        key="close"
        onClick={() => {
          hide();
        }}
        width="2.4rem"
      />
    : null;

  const icon = growl.icon ? icons[growl.icon] : null;

  const growlHeader =
    growl.title || icon ?
      <GrowlHeader>
        {icon}
        {growl.title && (
          <GrowlTitle
            data-test="growl-title"
            hasIcon={!!icon}
            key="growlTitle"
            sticky={growl.sticky}
          >
            {growl.title}
          </GrowlTitle>
        )}
        {closeButton}
      </GrowlHeader>
    : closeButton;

  return (
    <GrowlContainer
      css={{
        opacity,
        transition: `opacity ${fadeTime}ms`,
      }}
      data-test={dataTest ?? 'growl'}
      key={growl.id}
    >
      {growlHeader}
      <GrowlDescription data-test="growl-description" hasIcon={!!icon}>
        {growl.description}
      </GrowlDescription>
    </GrowlContainer>
  );
};

export default Growl;
