import loadable from '@loadable/component';
import useModal from 'hooks/useModal';
import useMount from 'hooks/useMount';
import usePlayerActions from 'components/Player/PlayerActions/usePlayerActions';
import usePlayerState from 'contexts/PlayerState/usePlayerState';
import { getUI } from 'state/UI/selectors';
import { makeGetQueryStringParam } from 'state/Routing/selectors';
import { setIsFSPOpen } from 'state/UI/actions';
import { useCallback, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { FunctionComponent } from 'react';
import type { State } from 'state/types';

const FullScreenPlayer = loadable(
  () => import('components/Player/FullscreenPlayer'),
);

const FullScreenPlayerModal: FunctionComponent = () => {
  const actions = usePlayerActions();
  const playerState = usePlayerState();
  const dispatch = useDispatch();

  const expandedQS = useSelector<State, boolean>(
    makeGetQueryStringParam('fs', false),
  );
  const isOpen = useSelector<State, boolean>(
    state => getUI(state)?.isFSPOpen ?? false,
  );

  const onClose = useCallback(() => {
    actions.minimize();
    dispatch(setIsFSPOpen(false));
  }, [actions.minimize]);

  const onOpen = useCallback(() => {
    actions.expand();
  }, [actions.expand]);

  const [Modal, , setIsOpen] = useModal({
    onOpen,
    onClose,
  });

  useMount(() => {
    if (expandedQS) dispatch(setIsFSPOpen(true));
  });

  useEffect(() => {
    setIsOpen(isOpen);
  }, [isOpen]);

  const minimize = useCallback(() => setIsOpen(false), [setIsOpen]);

  if (!playerState) return null;

  return (
    <Modal>
      <Modal.Container>
        <FullScreenPlayer minimize={minimize} />
      </Modal.Container>
    </Modal>
  );
};

export default FullScreenPlayerModal;
