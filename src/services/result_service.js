import axios from 'axios';

const API_BASE_URL = 'http://localhost:3030/api';

const api = axios.create({
    baseURL: API_BASE_URL,
});

// Attach token
api.interceptors.request.use(
    (config) => {
        const token = sessionStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

const resultService = {

    //  Submit Quiz (matches: POST /api/results/submit)
    submitQuiz: async (quizId, answers) => {
        try {
            const response = await api.post("/results/submit", {
                quizId,
                answers
            });
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    //  Get logged user results (matches: GET /api/results/my-results)
    getUserResults: async () => {
        try {
            const response = await api.get("/results/my-results");
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    //  Get single result (matches: GET /api/results/:id)
    getResultById: async (resultId) => {
        try {
            const response = await api.get(`/results/${resultId}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    //  Delete result (matches: DELETE /api/results/:id)
    deleteResult: async (resultId) => {
        try {
            const response = await api.delete(`/results/${resultId}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },
};

export default resultService;