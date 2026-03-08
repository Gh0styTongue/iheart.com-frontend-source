import * as actions from 'components/Player/PlayerActions/shims';

type PlayerActions = typeof actions;

const usePlayerActions = (): PlayerActions => actions;

export default usePlayerActions;
