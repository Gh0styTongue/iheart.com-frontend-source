import analytics, { Events } from 'modules/Analytics';
import CloseIcon from 'components/BaseShare/primitives/CloseIcon';
import {
  BackgroundCloseButton,
  CloseButton,
  Container,
  Content,
} from './primitives';
import { createPortal } from 'react-dom';
import { useCallback, useEffect, useState } from 'react';
import type { ComponentType, ReactNode } from 'react';

const ESCAPE_KEY = 27;

type Params = {
  onClose?: () => void;
  onOpen?: () => void;
};

export type ModalType = ComponentType<{
  children: ReactNode;
}> & {
  Close: ComponentType;
  Container: ComponentType<{ className?: string; onClick?: () => void }>;
  Content: typeof Content;
};

function useModal({ onClose, onOpen }: Params = {}): [
  ModalType,
  () => void,
  (state?: boolean) => void,
] {
  const [open, setOpen] = useState<boolean>(false);

  useEffect(() => {
    window.document.body.style.overflowY = open ? 'hidden' : 'scroll';
  }, [open]);

  const setIsOpen = useCallback(
    (forceState?: boolean): void => {
      const willOpen = forceState ?? !open;
      setOpen(willOpen);

      // Prevents successive calls with same params from re-triggering cb's
      if (willOpen !== open) {
        if (typeof onOpen === 'function' && willOpen) onOpen();
        else if (typeof onClose === 'function' && !willOpen) onClose();
      }
    },
    [onClose, onOpen, open],
  );

  const toggle = useCallback(() => {
    const events = window.analyticsData?.events;
    // get pageName from second-to-last page_view event (the page the user was on before modal was opened)
    const pageName =
      events?.page_view?.[(events?.page_view?.length ?? 1) - 2]?.pageName;
    analytics.track(Events.PageView, { pageName });
    setIsOpen();
  }, [setIsOpen]);

  const onEsc = useCallback(
    (e: KeyboardEvent): void => {
      if (e.keyCode !== ESCAPE_KEY || !open) return;
      toggle();
    },
    [open, toggle],
  );

  useEffect(() => {
    if (open) {
      window.addEventListener('keyup', onEsc);
      return () => {
        window.removeEventListener('keyup', onEsc);
      };
    }
    return () => {};
  }, [open]);

  const Modal = useCallback(
    ({ children }) => {
      if (!open) return null;

      return createPortal(children, window.document.body);
    },
    [open, toggle],
  ) as ModalType;

  const Close = useCallback(
    () => (
      <CloseButton
        data-test="modal-close-button"
        onClick={toggle}
        type="button"
      >
        <CloseIcon />
      </CloseButton>
    ),
    [toggle],
  );

  const ModalContainer: ModalType['Container'] = useCallback(
    ({ children, className, onClick }) => (
      <Container className={className} data-test="modal-container">
        <BackgroundCloseButton
          onClick={() => {
            toggle();
            onClick?.();
          }}
        />
        {children}
      </Container>
    ),
    [toggle],
  );

  Modal.Content = Content;
  Modal.Container = ModalContainer;
  Modal.Close = Close;

  return [Modal, toggle, setIsOpen];
}

export default useModal;
