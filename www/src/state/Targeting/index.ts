import Targeting, { initialState } from './Targeting';

const {
  actions: { setGlobalTargeting, setPlayerTargeting },
  reducer,
  selector: getTargeting,
} = Targeting;

export { getTargeting, initialState, setGlobalTargeting, setPlayerTargeting };
export default reducer;
