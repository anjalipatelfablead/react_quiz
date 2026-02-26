import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import userService from '../../services/user_service';

// Get user from sessionStorage
const getUserFromSession = () => {
  const userStr = sessionStorage.getItem('user');
  return userStr ? JSON.parse(userStr) : null;
};

const getTokenFromSession = () => {
  return sessionStorage.getItem('token');
};

const initialState = {
  user: getUserFromSession(),
  token: getTokenFromSession(),
  isLoading: false,
  isSuccess: false,
  isError: false,
  message: '',
  errors: null,
};

// Register user
export const register = createAsyncThunk(
  'auth/register',
  async (userData, thunkAPI) => {
    try {
      const response = await userService.register(userData);
      
      // Store user and token in sessionStorage
      if (response.token) {
        sessionStorage.setItem('token', response.token);
      }
      if (response.user) {
        sessionStorage.setItem('user', JSON.stringify(response.user));
        // sessionStorage.setItem('username', response.user.username);
        // sessionStorage.setItem('email', response.user.email);
      }
      
      return response;
    } catch (error) {
      return thunkAPI.rejectWithValue(error);
    }
  }
);

// Login user
export const login = createAsyncThunk(
  'auth/login',
  async (credentials, thunkAPI) => {
    try {
      const response = await userService.login(credentials);
      
      // Store user and token in sessionStorage
      if (response.token) {
        sessionStorage.setItem('token', response.token);
      }
      if (response.user) {
        sessionStorage.setItem('user', JSON.stringify(response.user));
        // sessionStorage.setItem('username', response.user.username);
        // sessionStorage.setItem('email', response.user.email);
      }
      
      return response;
    } catch (error) {
      return thunkAPI.rejectWithValue(error);
    }
  }
);

// Logout user
export const logout = createAsyncThunk('auth/logout', async () => {
  sessionStorage.removeItem('user');
  sessionStorage.removeItem('token');
  sessionStorage.removeItem('username');
  sessionStorage.removeItem('email');
});

// Get user profile
export const getProfile = createAsyncThunk(
  'auth/getProfile',
  async (_, thunkAPI) => {
    try {
      const response = await userService.getMyProfile();
      return response;
    } catch (error) {
      const message = error.message || 'Failed to fetch profile';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    reset: (state) => {
      state.isLoading = false;
      state.isSuccess = false;
      state.isError = false;
      state.message = '';
      state.errors = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Register
      .addCase(register.pending, (state) => {
        state.isLoading = true;
        state.isError = false;
        state.message = '';
        state.errors = null;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.message = action.payload.message || 'Registration successful';
        state.errors = null;
      })
      .addCase(register.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload?.message || 'Registration failed';
        state.errors = action.payload?.errors || null;
        state.user = null;
        state.token = null;
      })
      // Login
      .addCase(login.pending, (state) => {
        state.isLoading = true;
        state.isError = false;
        state.message = '';
        state.errors = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.message = action.payload.message || 'Login successful';
        state.errors = null;
      })
      .addCase(login.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload?.message || 'Login failed';
        state.errors = action.payload?.errors || null;
        state.user = null;
        state.token = null;
      })
      // Logout
      .addCase(logout.fulfilled, (state) => {
        state.user = null;
        state.token = null;
        state.isSuccess = false;
        state.message = '';
      })
      // Get Profile
      .addCase(getProfile.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getProfile.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
      })
      .addCase(getProfile.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      });
  },
});

export const { reset } = authSlice.actions;
export default authSlice.reducer;
