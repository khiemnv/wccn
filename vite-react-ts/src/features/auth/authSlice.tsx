import { createAsyncThunk, createSlice, type PayloadAction } from '@reduxjs/toolkit';
// import jwt_decode from "jwt-decode";
// import { retryAxios } from '../../components/retry/axiosRetry';

// const parseJwt = (token) => {
//   try {
//     return JSON.parse(atob(token.split('.')[1]));
//   } catch (e) {
//     return {};
//   }
// };
// export const parseJwt = (token: string) => {
//   try {
//     return JSON.parse(Buffer.from(token.split(".")[1], "base64"));
//   } catch (e) {
//     return {};
//   }
// };

function jwt_decode(token: string) {
  const base64Url = token.split('.')[1] ?? '';
  const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
  const jsonPayload = decodeURIComponent(
    atob(base64)
      .split('')
      .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
      .join('')
  );

  return JSON.parse(jsonPayload);
}

type FetchTokenArgs = {
  username: string;
  password: string;
};

type FetchTokenSuccess = {
  username: string;
  token: string;
  role: string;
};

type FetchTokenError = {
  error: string;
};

export const fetchToken = async ({ username, password }: FetchTokenArgs): Promise<FetchTokenSuccess | FetchTokenError> => {
  try {
    console.log(username, password);

    const res = {} as { data: { token: string } };
    // var res = await retryAxios.requestApi({method:"post", api:"users/login", data});
    // if (res.status !== 200) {
    //   return {error:res.statusText};
    // }

    const token = res.data?.token ?? '';
    if (!token) {
      return { error: 'No token returned from login' };
    }

    const decodedToken = jwt_decode(token);
    const role = decodedToken?.role ?? '';

    if (role === 'admin' || role === 'manager') {
      localStorage.setItem('token', token);
      return {
        username,
        token,
        role,
      };
    }

    return { error: 'Invalid role!' };
  } catch (ex) {
    const message = ex instanceof Error ? ex.message : String(ex);
    console.log(message);
    return { error: message };
  }
};

export const loginAsync = createAsyncThunk(
  'auth/loginAsync',
  fetchToken
);

type RoleObj = {
  sys: string;
};

type AuthState = {
  username: string;
  token: string;
  role: string;
  roleObj: RoleObj | null;
  gdocToken: string | null;
  autologin: boolean;
  status: 'idle' | 'loading';
};

const initialState: AuthState = {
  username: '',
  token: '',
  role: '',
  roleObj: null,
  gdocToken: null,
  autologin: false,
  status: 'idle',
};

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    login: (state, action: PayloadAction<{ username: string; token: string; role: string; roleObj: RoleObj | null }>) => {
      state.username = action.payload.username;
      state.token = action.payload.token;
      state.role = action.payload.role;
      state.roleObj = action.payload.roleObj;
    },
    logout: (state) => {
      state.username = '';
      state.token = '';
      state.role = '';
      state.roleObj = null;
      state.autologin = false;
    },
    setRoleObj: (state, action: PayloadAction<{ roleObj: RoleObj | null }>) => {
      state.roleObj = action.payload.roleObj;
    },
    setGdocToken: (state, action: PayloadAction<{ gdocToken: string | null }>) => {
      state.gdocToken = action.payload.gdocToken;
    },
  },
  // extraReducers: (builder) => {
  //   builder
  //     .addCase(loginAsync.fulfilled, (state, action: { payload: { token: string; username: string; role: string; error: any, roleObj: any } }) => {
  //       state.status = 'idle';
  //       console.log(action);
  //       if (!action.payload.error)
  //       {
  //         state.token = action.payload.token;
  //         state.username = action.payload.username;
  //         state.role = action.payload.role;
  //         state.roleObj = action.payload.roleObj;
  //       }
  //     })
  //     .addCase(loginAsync.pending, (state) => {
  //       state.status = 'loading';
  //     });
  // },
});

export const { 
  login,
  logout,
  setRoleObj,
  setGdocToken,
} = authSlice.actions;
type RootState = {
  auth: AuthState;
};

export const selectToken = (state: RootState) => state.auth.token;
export const selectUsername = (state: RootState) => state.auth.username;
export const selectAutologin = (state: RootState) => state.auth.autologin;
export const selectRoleObj = (state: RootState) => state.auth.roleObj;
export const selectGdocToken = (state: RootState) => state.auth.gdocToken;
export default authSlice.reducer;
