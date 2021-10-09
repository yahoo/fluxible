import { createReducerStore } from 'fluxible-reducer-store';

const AppStore = createReducerStore({
    storeName: 'AppStore',
    initialState: { number: 0 },
    reducers: {
        SET_NUMBER: (state, { number }) => ({ ...state, number }),
    },
    getters: {
        getNumber: ({ number }) => number,
    },
});

export default AppStore;
