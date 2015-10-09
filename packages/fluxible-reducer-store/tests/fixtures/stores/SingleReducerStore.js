import {createReducerStore} from '../../../index';

var SingleReducerStore = createReducerStore({
    storeName: 'SingleReducerStore',
    reducer: (state, payload, type) => {
        if ('RECEIVE_MESSAGES' === type) {
            return {
                ...state,
                count: state.count + (payload.length)
            };
        }
        return state;
    },
    initialState: {
        count: 0
    }
});

export default SingleReducerStore;
