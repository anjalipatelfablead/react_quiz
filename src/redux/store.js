import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import quizReducer from './slices/quizSlice';
import questionReducer from './slices/questionSlice';
import resultReducer from './slices/resultSlice';
import themeReducer from './slices/themeSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    quiz: quizReducer,
    question: questionReducer,
    result: resultReducer,
    theme: themeReducer,
  },
});
