import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
// import jwt_decode from "jwt-decode";
// import { retryAxios } from '../../components/retry/axiosRetry';

// const parseJwt = (token) => {
//   try {
//     return JSON.parse(atob(token.split('.')[1]));
//   } catch (e) {
//     return {};
//   }
// };
const parseJwt = (token) => {
  try {
    return JSON.parse(Buffer.from(token.split(".")[1], "base64"));
  } catch (e) {
    return {};
  }
};

export const loadState = () => {
  // var autologin = localStorage.getItem("autologin") === "true";
  // console.log(autologin)
  const autologin = true;
  var token = autologin ? localStorage.getItem("token") : "";
  token = token? token:"";
  var decoded = (autologin && token) ? parseJwt(token) : {name:'', role:''};

  return({
  autologin: autologin,
  token: token,
  username: decoded.name,
  password: '',
  role: decoded.role,
  status: 'idle',
})};

function jwt_decode(token) {
  const base64Url = token.split('.')[1];
  const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
  const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
  }).join(''));

  return JSON.parse(jsonPayload);
}

export const fetchToken = async ({ username, password }) => {
  try {

    console.log(username,password)
    let data = JSON.stringify({
      email: username,
      password: password
    });

    var res = {}
    // var res = await retryAxios.requestApi({method:"post", api:"users/login", data});
    // if (res.status !== 200) {
    //   return {error:res.statusText};
    // } 

    // console.log(res.data)
    var {token} = res.data;
    const decodedToken = jwt_decode(token);
    var {role} = decodedToken;

    // admin, manager
    if (role === "admin" || role === "manager") {
      localStorage.setItem("token", token);
      return {
        username,
        password,
        token: token,
        role
      };
    }
    else {
      return {error:"Invalid role!"}
    }
  } catch (ex) {
    console.log(ex.message);
    return {error:ex.message}
  }
};

export const loginAsync = createAsyncThunk(
  'auth/loginAsync',
  fetchToken
);

export const authSlice = createSlice({
  name: 'auth',
  initialState: {},
  reducers: {
    login: (state, action) => {
      // console.log(action);
      state.username = action.payload.username;
      state.token = action.payload.token;
      state.role = action.payload.role;
      state.roleObj = action.payload.roleObj;
      // localStorage.setItem("token",action.token);
    },
    logout: (state) => {
      state.username = '';
      // state.password = '';
      state.token = '';
      state.role = '';
      state.roleObj = null;
      localStorage.removeItem("token");
    },
    setAutologin: (state, action) => {
      state.autologin = action.payload.autologin;
    },
    setRoleObj: (state, action) => {
      const {roleObj} = action.payload;
      state.roleObj = roleObj;
    },
    setBtcTv: (state, action) => {
      const {btcTv} = action.payload;
      state.btcTv = btcTv;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginAsync.fulfilled, (state, action) => {
        state.status = 'idle';
        console.log(action);
        if (!action.payload.error)
        {
          state.token = action.payload.token;
          state.username = action.payload.username;
          state.role = action.payload.role;
          state.roleObj = action.payload.roleObj;
        }
      })
      .addCase(loginAsync.pending, (state) => {
        state.status = 'loading';
      });
  },
});

export const { login, logout, setRoleObj, setBtcTv, setAutologin } = authSlice.actions;
export const selectToken = (state) => state.auth.token;
export const selectUsername = (state) => state.auth.username;
export const selectAutologin = (state) => state.auth.autologin;
export const selectRoleObj = (state) => state.auth.roleObj;
export const selectBtcTv = (state) => state.auth.btcTv;
export default authSlice.reducer;
