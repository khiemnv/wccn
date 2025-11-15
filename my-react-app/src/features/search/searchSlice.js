import { createSelector, createSlice } from "@reduxjs/toolkit";

const initialState = {
  titles: [],
  keys: [],
  QA : {keys: [], titles: []},
  BBH : {keys: [], titles: []},
  mode: "QA",
  sortByDate: "dsc",
  tags: undefined,
  status: "idle",
};

export const slice = createSlice({
  name: "search",
  initialState,
  reducers: {
    editTitle: (state, action) => {
      const { id, changes, mode } = action.payload;
      const title = state[mode].titles.find((t) => t.titleId === id);
      patch(title, changes);
    },
    addTitle: (state, action) => {
      const { title, mode } = action.payload;
      if (!state[mode].titles.find(t=>t.titleId === title.titleId)) {
        state[mode].titles.push(title);
      }
    },
    deleteTitle: (state, action) => {
      const { titleId, mode } = action.payload;
      const index = state[mode].titles.findIndex(t=>t.titleId === titleId)
      if (index !== -1) {
        state[mode].titles.splice(index,1);
      }
    },
    editKey: (state, action) => {
      const { id, changes, mode } = action.payload;
      const key = state[mode].keys.find((k) => k.keyId === id);
      patch(key, changes);
    },
    addKey: (state, action) => {
      const {key, mode} = action.payload;
      if (state[mode].keys.find(k=>k.keyId === key.keyId)) {
        // already exists
      } else {
        state[mode].keys.push(key);
      }
    },
    deleteKey: (state, action) => {
      const { keyId, mode } = action.payload;
      const index = state[mode].keys.findIndex(k=>k.keyId === keyId)
      if (index !== -1) {
        state[mode].keys.splice(index,1);
      }
    },
    changeMode: (state, action) => {
      const {mode} = action.payload;
      state.mode = mode;
    },
    setSortByDate: (state, action) => {
      const { sortByDate } = action.payload;
      state.sortByDate = sortByDate;
    },
    addTag: (state, action) => {
      const { tag } = action.payload;
      if (!state.tags.includes(tag)) {
        state.tags.push(tag);
      }
    },
    removeTag: (state, action) => {
      const { tag } = action.payload;
      const index = state.tags.indexOf(tag);
      if (index !== -1) {
        state.tags.splice(index, 1);
      }
    },
    setTags: (state, action) => {
      const { tags } = action.payload;
      state.tags = tags;
    },
    clearTags: (state) => {
      state.tags = [];
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
  changeMode,
  setSortByDate,
  addTag,
  removeTag,
  setTags,
  clearTags,
} = slice.actions;
const selectSearch = (state) => state.search;
const selectModePara = (state, mode) => mode;
const selectModeTitlesPara = (state, mode, ids) => ids;
export const selectTitlesByIds = 
  createSelector([selectSearch, selectModePara, selectModeTitlesPara], (search, mode, ids) =>
  { 
    console.log("Selecting titles by ids:", ids, "in mode:", mode);
    return search[mode].titles.filter((t) => ids.includes(t.titleId)); 
  }
  );
const selectModeTitleParam = (state, mode, id) => id;
export const selectTitleById = 
  createSelector([selectSearch, selectModePara, selectModeTitleParam], (search, mode, id) =>
    search[mode].titles.find((t) => t.titleId === id)
  );

export const selectAllKeys = 
createSelector([selectSearch, selectModePara], (search, mode) => search[mode].keys);
const selectModeKeysPara = (state, mode, ids) => ids;
export const selectKeysByIds = 
  createSelector([selectSearch, selectModePara, selectModeKeysPara], (search, mode, ids) => search[mode].keys.filter((k) => ids.includes(k.keyId)));
export const selectKeyById = (id) =>
  createSelector([selectAllKeys], (keys) => keys.find((k) => k.keyId === id));
export const selectMode = (state) => state.search.mode;
export const selectSortByDate = (state) => state.search.sortByDate;
export const selectTags = (state) => state.search.tags;
export default slice.reducer;

function patch(entity,changes) {
  Object.keys(changes).forEach((key) => (entity[key] = changes[key]));
}

