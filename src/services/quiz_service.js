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

// Quiz Service API calls
const quizService = {
  // Get all quizzes
  getAllQuizzes: async () => {
    try {
      const response = await api.get('/quizzes');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get single quiz by ID
  getQuizById: async (quizId) => {
    try {
      const response = await api.get(`/quizzes/${quizId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Create new quiz (Admin only)
  createQuiz: async (quizData) => {
    try {
      const response = await api.post('/quizzes', quizData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Update quiz (Admin only)
  updateQuiz: async (quizId, quizData) => {
    try {
      const response = await api.put(`/quizzes/${quizId}`, quizData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Delete quiz (Admin only)
  deleteQuiz: async (quizId) => {
    try {
      const response = await api.delete(`/quizzes/${quizId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },
};

export default quizService;
