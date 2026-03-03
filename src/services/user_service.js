import axios from 'axios';

// Base API URL - Update this to match your Node.js backend
const API_BASE_URL = 'http://localhost:3030/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if available
api.interceptors.request.use(
  (config) => {
    const token = sessionStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// User Service API calls
const userService = {
  // Register new user
  register: async (userData) => {
    try {
      const formData = new FormData();
      formData.append('username', userData.username);
      formData.append('email', userData.email);
      formData.append('password', userData.password);
      if (userData.profileImage) {
        formData.append('profileImage', userData.profileImage);
      }
      if (userData.role) {
        formData.append('role', userData.role);
      }

      const response = await axios.post(`${API_BASE_URL}/users/register`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      // Extract full error data from backend response
      if (error.response?.data) {
        throw error.response.data;
      }
      throw { message: error.message || 'Registration failed' };
    }
  },

  // Login user
  login: async (credentials) => {
    try {
      const formData = new FormData();
      formData.append('email', credentials.email);
      formData.append('password', credentials.password);

      const response = await axios.post(`${API_BASE_URL}/users/login`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      // Extract full error data from backend response
      if (error.response?.data) {
        throw error.response.data;
      }
      // Handle network errors
      if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
        throw { 
          message: 'Unable to connect to server. Please check your internet connection or try again later.' 
        };
      }
      throw { message: error.message || 'Login failed' };
    }
  },

  // Get current user profile
  getMyProfile: async () => {
    try {
      const response = await api.get('/users/profile/me');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Update current user profile
  updateMyProfile: async (userData) => {
    try {
      const formData = new FormData();
      if (userData.username) formData.append('username', userData.username);
      if (userData.email) formData.append('email', userData.email);
      if (userData.password) formData.append('password', userData.password);
      if (userData.profileImage) {
        formData.append('profileImage', userData.profileImage);
      }

      const response = await api.put('/users/profile/me', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Delete current user account
  deleteMyAccount: async () => {
    try {
      const response = await api.delete('/users/profile/me');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get all users (Admin only)
  getAllUsers: async () => {
    try {
      const response = await api.get('/users');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get user by ID
  getUserById: async (userId) => {
    try {
      const response = await api.get(`/users/${userId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Update user by ID (Admin or own profile)
  updateUser: async (userId, userData) => {
    try {
      const formData = new FormData();
      if (userData.username) formData.append('username', userData.username);
      if (userData.email) formData.append('email', userData.email);
      if (userData.password) formData.append('password', userData.password);
      if (userData.role) formData.append('role', userData.role);
      if (userData.profileImage) {
        formData.append('profileImage', userData.profileImage);
      }

      const response = await api.put(`/users/${userId}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Delete user by ID (Admin only)
  deleteUser: async (userId) => {
    try {
      const response = await api.delete(`/users/${userId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Toggle user active status (Admin only)
  toggleUserStatus: async (userId) => {
    try {
      const response = await api.patch(`/users/${userId}/toggle-status`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Forgot password - request password reset
  forgotPassword: async (email) => {
    try {
      const formData = new FormData();
      formData.append('email', email);

      const response = await axios.post(`${API_BASE_URL}/users/forgot-password`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      if (error.response?.data) {
        throw error.response.data;
      }
      throw { message: error.message || 'Failed to process forgot password request' };
    }
  },

  // Reset password with token
  resetPassword: async (resetToken, newPassword) => {
    try {
      const formData = new FormData();
      formData.append('resetToken', resetToken);
      formData.append('newPassword', newPassword);

      const response = await axios.post(`${API_BASE_URL}/users/reset-password`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      if (error.response?.data) {
        throw error.response.data;
      }
      throw { message: error.message || 'Failed to reset password' };
    }
  },
};

export default userService;
