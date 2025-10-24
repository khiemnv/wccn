import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

const initialState = {
  users: [],
  status: "idle",
};

// user map
const map = new Map();

// load local stored data
function createMap(users) {
  map.clear();
  users.forEach((u) => map.set(u.email, u));
}

const ENABLE_CACHE = false;
function localSave(key, obj) {
  if (!ENABLE_CACHE) return;
  localStorage.setItem(key, JSON.stringify(obj));
}
function localRestore(key) {
  if (!ENABLE_CACHE) return;
  const text = localStorage.getItem(key);
  return JSON.parse(text);
}
function localLoadData() {
  if (!ENABLE_CACHE) return;
  try {
      initialState.members = localRestore("users");
  } catch (ex) {
    console.log(ex.messages);
  }
}

localLoadData(); // reduce fecth on debug

export const slice = createSlice({
  name: "user",
  initialState,
  reducers: {
    editUser: (state, action) => {
      const { id, changes } = action.payload;
      const user = state.users.find((u) => u.id === id);
      patch(user, changes);
    },
    addUser: (state, action) => {
      const { user } = action.payload;
      state.users.push(user);
    },
    setAllUsers: (state, action) => {
      const { users } = action.payload;
      state.users = users;
    },
    deleteUser: (state, action) => {
      const { userId } = action.payload;
      const index = state.users.findIndex(u=>u.id === userId)
      console.log(index, userId)
      if (index !== -1) {
        state.users.splice(index,1);
      }
    },
  },
  // extraReducers: (builder) => {
  //   builder
  //     .addCase(fetchDataAsync.fulfilled, (state, action) => {
  //       state.status = "idle";
  //       console.log("fetchWorkingTimeAsync", action);
  //       if (action.payload) {
  //         state.sheetData = action.payload.sheetData;
  //         state.sheetHdr = action.payload.sheetHdr;
  //       }
  //     })
  //     .addCase(fetchDataAsync.pending, (state) => {
  //       state.status = "loading";
  //     });
  // },
});

export const {
  editUser,
  addUser,
  setAllUsers,
  deleteUser,
} = slice.actions;
export const selectUsers = (state) => state.user.users;
export const selectUserById = (state, id) =>
  state.user.users.find((u) => u.id === id);

export default slice.reducer;
function patch(entity,changes) {
  Object.keys(changes).forEach((key) => (entity[key] = changes[key]));
}

