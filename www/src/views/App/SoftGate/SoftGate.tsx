import countryCodes from 'constants/countryCodes';
import hub, { E } from 'shared/utils/Hub';
import PLAYED_FROM from 'modules/Analytics/constants/playedFrom';
import useLocalStorage from 'hooks/useLocalStorage';
import useMount from 'hooks/useMount';
import usePlayerState from 'contexts/PlayerState/usePlayerState';
import { getCountryCode } from 'state/Config/selectors';
import { getIsLoggedOut } from 'state/Session/selectors';
import { makeGetQueryStringParam } from 'state/Routing/selectors';
import { openSignupModal } from 'state/UI/actions';
import { useDispatch, useSelector } from 'react-redux';
import { useRef } from 'react';

type Props = {
  /* This is the amount of time it takes before a signup modal pops up in milliseconds after initial load. */
  delay?: number;
  /* This is the delay between concurrent softgate events in milliseconds. */
  frequencyDelay?: number;
  /* This is the key that should be used to get/set local storage values. */
  key?: string;
};

function SoftGate({
  delay = 30 * 1000, // By default we use 30 seconds.
  frequencyDelay = 12 * 3600 * 1000, // Be default we space out softgate events by  6 hours.
  key = 'ihr-last-softgate',
}: Props) {
  const active = useSelector(makeGetQueryStringParam('softgateActive', true));
  const countryCode = useSelector(getCountryCode);
  const dispatch = useDispatch();
  const loggedOut = useSelector(getIsLoggedOut);
  const timeout = useRef<number>(delay);
  const timer = useRef<number | null>(null);
  const [lastSoftgate, setLastSoftgate] = useLocalStorage<string | null>(
    key,
    null,
  );
  const { stationId, stationType } = usePlayerState() ?? {};

  function activate() {
    if (stationId && stationType) {
      hub.trigger(
        E.AUTH_LOAD_HANDLE,
        'createRadio',
        stationType,
        stationId,
        PLAYED_FROM.PLAYER_PLAY,
      );
    }

    dispatch(
      openSignupModal({
        context: 'softgate',
        signupFlow: 'softgate',
      }),
    );

    setLastSoftgate(String(Date.now()));

    timeout.current = delay + frequencyDelay;
  }

  function countdown() {
    if (timer.current !== null) window.clearTimeout(timer.current);

    timer.current = window.setTimeout(() => {
      activate();
      countdown();
    }, timeout.current);
  }

  useMount(() => {
    if (!active || !loggedOut || countryCode === countryCodes.WW) return;

    if (lastSoftgate !== null) {
      const current =
        Number.parseInt(lastSoftgate, 10) + frequencyDelay - Date.now();
      timeout.current = current < delay ? delay : current;
    }

    hub.once(E.PLAY, countdown);
  });

  return null;
}

export default SoftGate;
