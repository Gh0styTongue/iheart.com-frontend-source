import { showNetworkErrorGrowl } from 'state/UI/actions';
import { useCallback, useEffect } from 'react';
import { useDispatch } from 'react-redux';

export default function OfflineHandler() {
  const dispatch = useDispatch();

  const offlineCallback = useCallback(() => {
    dispatch(showNetworkErrorGrowl());
  }, [dispatch]);

  useEffect(() => {
    window.addEventListener('offline', offlineCallback);
    return () => window.removeEventListener('offline', offlineCallback);
  }, [offlineCallback]);

  return <></>;
}
