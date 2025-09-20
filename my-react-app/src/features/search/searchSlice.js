import { createAsyncThunk, createSelector, createSlice } from "@reduxjs/toolkit";

const initialState = {
  titles: [],
  keys: [],
  status: "idle",
};

export const slice = createSlice({
  name: "search",
  initialState,
  reducers: {
    editTitle: (state, action) => {
      const { id, changes } = action.payload;
      const title = state.titles.find((t) => t.titleId === id);
      patch(title, changes);
    },
    addTitle: (state, action) => {
      const { title } = action.payload;
      if (!state.titles.find(t=>t.titleId === title.titleId)) {
        state.titles.push(title);
      }
    },
    deleteTitle: (state, action) => {
      const { titleId } = action.payload;
      const index = state.titles.findIndex(t=>t.titleId === titleId)
      if (index !== -1) {
        state.titles.splice(index,1);
      }
    },
    editKey: (state, action) => {
      const { id, changes } = action.payload;
      const key = state.keys.find((k) => k.keyId === id);
      patch(key, changes);
    },
    addKey: (state, action) => {
      const {key} = action.payload;
      if (state.keys.find(k=>k.keyId === key.keyId)) {
        // already exists
      } else {
        state.keys.push(key);
      }
    },
    deleteKey: (state, action) => {
      const { keyId } = action.payload;
      const index = state.keys.findIndex(k=>k.keyId === keyId)
      if (index !== -1) {
        state.keys.splice(index,1);
      }
    },
  },
});

export const {
  editTitle,
  addTitle,
  deleteTitle,
  editKey,
  addKey,
  deleteKey,
} = slice.actions;
export const selectAllTitles = (state) => state.search.titles;
export const selectTitlesByIds = (ids) =>
  createSelector([selectAllTitles], (titles) =>
    titles.filter((t) => ids.includes(t.titleId))
  );
export const selectTitleById = (id) =>
  createSelector([selectAllTitles], (titles) =>
    titles.find((t) => t.titleId === id)
  );
export const selectAllKeys = (state) => state.search.keys;
export const selectKeysByIds = (ids) =>
  createSelector([selectAllKeys], (keys) => keys.filter((k) => ids.includes(k.keyId)));
export const selectKeyById = (id) =>
  createSelector([selectAllKeys], (keys) => keys.find((k) => k.keyId === id));

export default slice.reducer;

function patch(entity,changes) {
  Object.keys(changes).forEach((key) => (entity[key] = changes[key]));
}

