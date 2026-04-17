import { createSelector, createSlice, type PayloadAction } from "@reduxjs/toolkit";
type Mode = "QA" | "BBH";
type ParagraphViewMode = 0 | 1 | 2;
type DictEntry = {
  find: string;
  replace: string;
  isReg: boolean;
  selected: boolean;
};

export type TitleItem = {
  titleId: number;
  title: string;
  path: string;
  [key: string]: unknown;
};

type Key = {
  keyId: number;
  [key: string]: unknown;
};
type Tag = {
  id: string;
  [key: string]: unknown;
};
type ModeState = {
  keys: Key[];
  titles: TitleItem[];
};
type SearchState = {
  titles: TitleItem[];
  keys: Key[];
  QA: ModeState;
  BBH: ModeState;
  mode: Mode;
  titleId: number;
  searchStr: string;
  searchPage: number;
  sortByDate: string;
  tags: Tag[];
  status: string;
  dict: DictEntry[];
  editMode: "basic" | "advanced";
  autoSave: boolean;
  paragraphViewMode: ParagraphViewMode;
  gdocToken: string | null;
};
const dict: DictEntry[] = [
    {
        "find": "\\s+([.,:;?!])\\s*",
        "replace": "$1 ",
        "isReg": true,
        "selected": true
    },
    {
        "find": "ĐT",
        "replace": "đạo tràng",
        "isReg": false,
        "selected": true
    },
    {
        "find": "CLB",
        "replace": "câu lạc bộ",
        "isReg": false,
        "selected": true
    },
    {
        "find": "PT|Pt",
        "replace": "Phật tử",
        "isReg": true,
        "selected": true
    },
    {
        "find": "BQT",
        "replace": "Bát quan trai",
        "isReg": false,
        "selected": true
    }
]
const initialState: SearchState = {
  titles: [],
  keys: [],
  QA: { keys: [], titles: [] },
  BBH: { keys: [], titles: [] },
  mode: "QA",
  titleId: 1,
  searchStr: "",
  searchPage: 1,
  sortByDate: "dsc",
  tags: [],
  status: "idle",
  dict: dict,
  editMode: "basic", // basic or advanced
  autoSave: true,
  paragraphViewMode: 1, // 1: preview, 2: side by side, 0: diff
  gdocToken: null,
};

export const slice = createSlice({
  name: "search",
  initialState,
  reducers: {
    editTitle: (state, action: PayloadAction<{ id: number; changes: Partial<TitleItem>; mode: Mode }>) => {
      const { id, changes, mode } = action.payload;
      const idx = state[mode].titles.findIndex((t) => t.titleId === id);
      if (idx !== -1) {
        Object.assign(state[mode].titles[idx], changes);
      }
    },
    addTitle: (state, action: PayloadAction<{ title: TitleItem; mode: Mode }>) => {
      const { title, mode } = action.payload;
      if (!state[mode].titles.find((t) => t.titleId === title.titleId)) {
        state[mode].titles.push(title);
      }
    },
    deleteTitle: (state, action: PayloadAction<{ titleId: number; mode: Mode }>) => {
      const { titleId, mode } = action.payload;
      const index = state[mode].titles.findIndex((t) => t.titleId === titleId);
      if (index !== -1) {
        state[mode].titles.splice(index, 1);
      }
    },
    editKey: (state, action: PayloadAction<{ id: number; changes: Partial<Key>; mode: Mode }>) => {
      const { id, changes, mode } = action.payload;
      const key = state[mode].keys.find((k) => k.keyId === id);
      patch(key, changes);
    },
    addKey: (state, action: PayloadAction<{ key: Key; mode: Mode }>) => {
      const { key, mode } = action.payload;
      if (state[mode].keys.find((k) => k.keyId === key.keyId)) {
        // already exists
      } else {
        state[mode].keys.push(key);
      }
    },
    deleteKey: (state, action: PayloadAction<{ keyId: number; mode: Mode }>) => {
      const { keyId, mode } = action.payload;
      const index = state[mode].keys.findIndex((k) => k.keyId === keyId);
      if (index !== -1) {
        state[mode].keys.splice(index, 1);
      }
    },
    changeMode: (state, action) => {
      const {mode} = action.payload;
      state.mode = mode;
    },
    changeTitleId: (state, action) => {
      const {titleId} = action.payload;
      state.titleId = titleId;
    },
    changeEditMode: (state, action) => {
      const {editMode} = action.payload;
      state.editMode = editMode;
    },
    changeAutoSave: (state, action) => {
      const {autoSave} = action.payload;
      state.autoSave = autoSave;
    },
    changeParagraphViewMode: (state, action) => {
      const {paragraphViewMode} = action.payload;
      state.paragraphViewMode = paragraphViewMode;
    },
    changeSearchStr: (state, action) => {
      const {searchStr} = action.payload;
      state.searchStr = searchStr;
    },
    changeSearchPage: (state, action) => {
      const {searchPage} = action.payload;
      state.searchPage = searchPage;
    },
    setSortByDate: (state, action) => {
      const { sortByDate } = action.payload;
      state.sortByDate = sortByDate;
    },
    addTag: (state, action) => {
      const { tag } = action.payload;
      if (!state.tags.find(t=>t.id === tag.id)) {
        state.tags.push(tag);
      }
    },
    editTag: (state, action) => {
      const { id, changes } = action.payload;
      const tag = state.tags.find(t=>t.id === id);
      patch(tag, changes);
    },
    deleteTag: (state, action) => {
      const { id } = action.payload;
      const index = state.tags.findIndex(t=>t.id === id);
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
    setDict: (state, action) => {
      const { dict } = action.payload;
      state.dict = dict;    
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
  changeTitleId,
  changeEditMode,
  changeAutoSave,
  changeParagraphViewMode,
  changeSearchStr,
  changeSearchPage,
  setSortByDate,
  addTag,
  editTag,
  deleteTag,
  setTags,
  clearTags,
  setDict,
} = slice.actions;
const selectSearch = (state: any) => state.search as SearchState;
const selectModePara = (_state: any, mode: Mode) => mode;
const selectModeTitlesPara = (_state: any, _mode: Mode, ids: number[]) => ids;
export const selectTitlesByIds =
  createSelector([selectSearch, selectModePara, selectModeTitlesPara], (search: SearchState, mode: Mode, ids: number[]) => {
    return search[mode].titles.filter((t) => ids.includes(t.titleId));
  });
const selectModeTitleParam = (_state: any, _mode: Mode, id: number) => id;
export const selectTitleById =
  createSelector([selectSearch, selectModePara, selectModeTitleParam], (search: SearchState, mode: Mode, id: number) =>
    search[mode].titles.find((t) => t.titleId === id)
  );

export const selectAllKeys =
  createSelector([selectSearch, selectModePara], (search: SearchState, mode: Mode) => search[mode].keys);
const selectModeKeysPara = (_state: any, _mode: Mode, ids: number[]) => ids;
export const selectKeysByIds =
  createSelector([selectSearch, selectModePara, selectModeKeysPara], (search: SearchState, mode: Mode, ids: number[]) =>
    search[mode].keys.filter((k) => ids.includes(k.keyId))
  );
export const selectKeyById = (id: number) =>
  createSelector([selectAllKeys], (keys: Key[]) => keys.find((k) => k.keyId === id));
export const selectMode = (state: any) => state.search.mode as Mode;
export const selectSortByDate = (state: any) => state.search.sortByDate;
export const selectTags = (state: any) => state.search.tags;

export const selectTitleId = (state: any) => state.search.titleId;
export const selectSearchStr = (state: any) => state.search.searchStr;
export const selectDict = (state: any) => state.search.dict;
export const selectEditmode = (state: any) => state.search.editMode;
export const selectAutoSave = (state: any) => state.search.autoSave;
export const selectParagraphViewMode = (state: any) => state.search.paragraphViewMode;

export default slice.reducer;

function patch(entity: Record<string, unknown> | undefined, changes: Record<string, unknown>) {
  if (!entity) return;
  Object.keys(changes).forEach((key) => {
    entity[key] = changes[key];
  });
}

