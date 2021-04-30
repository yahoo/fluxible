import { createReducerStore } from "fluxible-reducer-store";

const UuidStore = createReducerStore({
  storeName: "uuid",
  initialState: { uuid: "" },
  reducers: {
    SET_UUID: (state, { uuid }) => ({ ...state, uuid }),
  },
  getters: {
    getUuid: ({ uuid }) => uuid,
  },
});

export default UuidStore;
