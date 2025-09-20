import { configureStore } from '@reduxjs/toolkit';
import userReducer from '../features/user/userSlice';
import authReducer from '../features/auth/authSlice';
import searchReducer from '../features/search/searchSlice';

export const store = configureStore({
  reducer: {
  auth: authReducer,
  user:userReducer,
  search: searchReducer,
  },
});