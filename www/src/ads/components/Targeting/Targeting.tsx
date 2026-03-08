import useCCPAOptOut from 'ads/shims/useCCPAOptOut';
import usePlayerTargeting from 'ads/targeting/usePlayerTargeting';
import useUserTargeting from 'ads/targeting/useUserTargeting';
import { setGlobalTargeting, setPlayerTargeting } from 'state/Targeting';
import { useDispatch } from 'react-redux';
import { useEffect } from 'react';
import type { FunctionComponent } from 'react';

const Targeting: FunctionComponent = () => {
  const isPIIRestricted = useCCPAOptOut();
  const dispatch = useDispatch();

  const playerTargeting = usePlayerTargeting();
  const userTargeting = useUserTargeting({ isPIIRestricted } as Parameters<
    typeof useUserTargeting
  >[0]);

  useEffect(() => {
    dispatch(setPlayerTargeting(playerTargeting));
  }, [playerTargeting, dispatch]);

  useEffect(() => {
    dispatch(setGlobalTargeting(userTargeting));
  }, [userTargeting, dispatch]);

  return null;
};

export default Targeting;
