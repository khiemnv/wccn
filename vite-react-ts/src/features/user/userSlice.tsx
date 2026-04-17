import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

interface User {
  id: number;
  username: string;
}

type UserState = {
  users: User[];
  status: "idle" | "loading";
};

const initialState: UserState = {
  users: [],
  status: "idle",
};

type EditUserPayload = {
  id: number;
  changes: Partial<User>;
};

type AddUserPayload = {
  user: User;
};

type SetAllUsersPayload = {
  users: User[];
};

type DeleteUserPayload = {
  userId: number;
};

export const slice = createSlice({
  name: "user",
  initialState,
  reducers: {
    editUser: (state, action: PayloadAction<EditUserPayload>) => {
      const { id, changes } = action.payload;
      const user = state.users.find((u) => u.id === id);
      if (user) {
        patch(user, changes);
      }
    },
    addUser: (state, action: PayloadAction<AddUserPayload>) => {
      const { user } = action.payload;
      state.users.push(user);
    },
    setAllUsers: (state, action: PayloadAction<SetAllUsersPayload>) => {
      state.users = action.payload.users;
    },
    deleteUser: (state, action: PayloadAction<DeleteUserPayload>) => {
      const { userId } = action.payload;
      const index = state.users.findIndex((u) => u.id === userId);
      if (index !== -1) {
        state.users.splice(index, 1);
      }
    },
  },
});

export const {
  editUser,
  addUser,
  setAllUsers,
  deleteUser,
} = slice.actions;

type RootState = {
  user: UserState;
};

export const selectUsers = (state: RootState) => state.user.users;
export const selectUserById = (state: RootState, id: number) =>
  state.user.users.find((u) => u.id === id);

export default slice.reducer;

function patch<T extends object>(entity: T, changes: Partial<T>) {
  Object.keys(changes).forEach((key) => {
    const k = key as keyof T;
    (entity as T)[k] = changes[k] as T[typeof k];
  });
}

