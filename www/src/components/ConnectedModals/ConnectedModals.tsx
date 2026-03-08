import loadable from '@loadable/component';
import useModal from 'hooks/useModal';
import { closeModal } from 'state/UI/actions';
import { ConnectedModals as ConnectedModalIds } from 'state/UI/constants';
import { getModal } from 'state/UI/selectors';
import { useCallback, useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom';
import type { ConnectedModal } from './types';
import type { FunctionComponent } from 'react';

const modals = {
  [ConnectedModalIds.AddEmailAndPassword]: loadable(
    () => import('components/AddEmailAndPasswordModal'),
  ),
  [ConnectedModalIds.AddToPlaylist]: loadable(
    () => import('components/AddToPlaylistModal'),
  ),
  [ConnectedModalIds.Alert]: loadable(() => import('components/AlertModal')),
  [ConnectedModalIds.Auth]: loadable(() => import('components/Auth/AuthModal')),
  [ConnectedModalIds.CanadaPrivacy]: loadable(
    () => import('components/CanadaPrivacyModal/CanadaPrivacyModal'),
  ),
  [ConnectedModalIds.Cancel]: loadable(() => import('components/CancelModal')),
  [ConnectedModalIds.ChangeEmail]: loadable(
    () => import('components/ChangeEmailModal'),
  ),
  [ConnectedModalIds.ChangeContactInfo]: loadable(
    () => import('components/ChangeContactInfoModal'),
  ),
  [ConnectedModalIds.ChangePassword]: loadable(
    () => import('components/ChangePasswordModal'),
  ),
  [ConnectedModalIds.Confirm]: loadable(
    () => import('components/ConfirmModal'),
  ),
  [ConnectedModalIds.CreatePlaylist]: loadable(
    () => import('components/CreatePlaylistModal'),
  ),
  [ConnectedModalIds.DeviceLimit]: loadable(
    () => import('components/DeviceLimitModal'),
  ),
  [ConnectedModalIds.DirectToAppStore]: loadable(
    () => import('components/DirectToAppStoreModal'),
  ),
  [ConnectedModalIds.Downgrade]: loadable(
    () => import('components/DowngradeModal'),
  ),
  [ConnectedModalIds.MobileDirect]: loadable(
    () => import('components/MobileDirectModal'),
  ),
  [ConnectedModalIds.NewFavorites]: loadable(
    () => import('components/NewFavoritesModal'),
  ),
  [ConnectedModalIds.RemovePlaylist]: loadable(
    () => import('components/RemovePlaylistModal'),
  ),
  [ConnectedModalIds.Search]: loadable(() => import('components/SearchModal')),
  [ConnectedModalIds.Share]: loadable(() => import('components/ShareModal')),
  [ConnectedModalIds.ThumbsTip]: loadable(
    () => import('components/ThumbsTipModal'),
  ),
  [ConnectedModalIds.TermsAndConditions]: loadable(
    () => import('components/TermsAndConditionsModal'),
  ),
  [ConnectedModalIds.UnderMaintenance]: loadable(
    () => import('components/UnderMaintenanceModal'),
  ),
  [ConnectedModalIds.Upsell]: loadable(() => import('components/UpsellModal')),
} as const;

const ConnectedModals: FunctionComponent = () => {
  const modalState = useSelector(getModal);
  const dispatch = useDispatch();
  const { pathname } = useLocation();
  const { context, id } = modalState;

  const onClose = useCallback(() => {
    dispatch(closeModal());
  }, [dispatch]);

  const [modal, , setOpen] = useModal({
    onClose,
  });

  /**
   * Close modal on url changes
   */
  useEffect(() => {
    setOpen(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  /**
   * If state.modal.id is in ConnectedModals then open
   * Otherwise close
   */
  useEffect(() => {
    if (id && ConnectedModalIds[id]) {
      setOpen(true);
    } else {
      setOpen(false);
    }
  }, [id, setOpen]);

  const Modal = useMemo(() => {
    if (!id || !ConnectedModalIds[id]) {
      return null;
    }

    return modals[id];
  }, [id]) as null | ConnectedModal<ConnectedModalIds>;

  if (!Modal) return null;

  return <Modal close={onClose} context={context} modal={modal} />;
};

export default ConnectedModals;
