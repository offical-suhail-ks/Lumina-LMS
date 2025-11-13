import { configureStore } from '@reduxjs/toolkit';
import authSlice from './authSlice';
import notificationSlice from './notificationSlice';
import themeSlice from './themeSlice';

const store = configureStore({
  reducer: {
    auth: authSlice,
    notifications: notificationSlice,
    theme: themeSlice,
  },
});

export default store;
