import { createSlice } from '@reduxjs/toolkit';
import { AUTH_STORAGE_KEY } from '../services/api';

function loadPersistedAuth() {
  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

const persisted = loadPersistedAuth();

const initialState = {
  user: persisted?.user ?? null,
  isAuthenticated: Boolean(persisted?.token),
  token: persisted?.token ?? null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    login(state, action) {
      state.user = action.payload;
      state.isAuthenticated = true;
      state.token = action.payload?.token ?? null;
      localStorage.setItem(
        AUTH_STORAGE_KEY,
        JSON.stringify({ user: action.payload, token: action.payload?.token ?? null })
      );
    },
    logout(state) {
      state.user = null;
      state.isAuthenticated = false;
      state.token = null;
      localStorage.removeItem(AUTH_STORAGE_KEY);
    },
  },
});

export const { login, logout } = authSlice.actions;
export default authSlice.reducer;
