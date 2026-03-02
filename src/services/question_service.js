import axios from 'axios';

// Base API URL - Update this to match your Node.js backend
const API_BASE_URL = 'http://localhost:3030/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  //   headers: {
  //     'Content-Type': 'application/json',
  //   },
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

// Question Service API calls
const questionService = {
  // Get all questions for a quiz
  getQuestionsByQuiz: async (quizId) => {
    try {
      const response = await api.get(`/questions/quiz/${quizId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get single question by ID
  getQuestionById: async (questionId) => {
    try {
      const response = await api.get(`/questions/${questionId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Create new question (Admin only)
  // createQuestion: async (questionData) => {
  //   try {
  //     const response = await api.post('/questions', questionData);
  //     return response.data;
  //   } catch (error) {
  //     throw error.response?.data || error.message;
  //   }
  // },

  createQuestion: async (questionData) => {
    const formData = new FormData();

    formData.append("quizId", questionData.quizId);
    formData.append("questionText", questionData.questionText);
    formData.append("correctAnswer", questionData.correctAnswer);
    formData.append("marks", questionData.marks);

    questionData.options.forEach((opt, index) => {
      formData.append(`options[${index}]`, opt);
    });

    const response = await api.post("/questions", formData); 

    return response.data;
  },

  // Update question (Admin only)
  updateQuestion: async (questionId, questionData) => {
    try {
      const response = await api.put(`/questions/${questionId}`, questionData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Delete question (Admin only)
  deleteQuestion: async (questionId) => {
    try {
      const response = await api.delete(`/questions/${questionId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Update questions order (Admin only)
  updateQuestionsOrder: async (questions) => {
    try {
      const response = await api.put('/questions/order/update', { questions });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },
};

export default questionService;
