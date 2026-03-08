import createReducer from 'state/createReducer';
import { initialState, queryForABTestGroup } from './reducers';
import { QUERY_FOR_AB_TEST_GROUP } from './constants';

const reducer = createReducer(initialState, {
  [QUERY_FOR_AB_TEST_GROUP]: queryForABTestGroup,
});

export default reducer;
