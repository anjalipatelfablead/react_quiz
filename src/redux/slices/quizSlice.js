import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import quizService from '../../services/quiz_service';

const initialState = {
  quizzes: [],
  currentQuiz: null,
  isLoading: false,
  isSuccess: false,
  isError: false,
  message: '',
};

// Get all quizzes
export const getAllQuizzes = createAsyncThunk(
  'quiz/getAll',
  async (_, thunkAPI) => {
    try {
      const response = await quizService.getAllQuizzes();
      return response;
    } catch (error) {
      const message = error.message || 'Failed to fetch quizzes';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Get single quiz by ID
export const getQuizById = createAsyncThunk(
  'quiz/getById',
  async (quizId, thunkAPI) => {
    try {
      const response = await quizService.getQuizById(quizId);
      return response;
    } catch (error) {
      const message = error.message || 'Failed to fetch quiz';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Create new quiz
export const createQuiz = createAsyncThunk(
  'quiz/create',
  async (quizData, thunkAPI) => {
    try {
      const response = await quizService.createQuiz(quizData);
      return response;
    } catch (error) {
      const message = error.message || 'Failed to create quiz';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Update quiz
export const updateQuiz = createAsyncThunk(
  'quiz/update',
  async ({ quizId, quizData }, thunkAPI) => {
    try {
      const response = await quizService.updateQuiz(quizId, quizData);
      return response;
    } catch (error) {
      const message = error.message || 'Failed to update quiz';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Delete quiz
export const deleteQuiz = createAsyncThunk(
  'quiz/delete',
  async (quizId, thunkAPI) => {
    try {
      const response = await quizService.deleteQuiz(quizId);
      return { ...response, quizId };
    } catch (error) {
      const message = error.message || 'Failed to delete quiz';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

const quizSlice = createSlice({
  name: 'quiz',
  initialState,
  reducers: {
    reset: (state) => {
      state.isLoading = false;
      state.isSuccess = false;
      state.isError = false;
      state.message = '';
    },
    clearCurrentQuiz: (state) => {
      state.currentQuiz = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Get All Quizzes
      .addCase(getAllQuizzes.pending, (state) => {
        state.isLoading = true;
        state.isError = false;
        state.message = '';
      })
      .addCase(getAllQuizzes.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.quizzes = action.payload.quizzes;
      })
      .addCase(getAllQuizzes.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      // Get Quiz By Id
      .addCase(getQuizById.pending, (state) => {
        state.isLoading = true;
        state.isError = false;
        state.message = '';
      })
      .addCase(getQuizById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.currentQuiz = action.payload.quiz;
      })
      .addCase(getQuizById.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      // Create Quiz
      .addCase(createQuiz.pending, (state) => {
        state.isLoading = true;
        state.isError = false;
        state.message = '';
      })
      .addCase(createQuiz.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.quizzes.unshift(action.payload.quiz);
        state.message = action.payload.message || 'Quiz created successfully';
      })
      .addCase(createQuiz.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      // Update Quiz
      .addCase(updateQuiz.pending, (state) => {
        state.isLoading = true;
        state.isError = false;
        state.message = '';
      })
      .addCase(updateQuiz.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        const updatedQuiz = action.payload.quiz;
        const index = state.quizzes.findIndex(q => q._id === updatedQuiz._id);
        if (index !== -1) {
          state.quizzes[index] = updatedQuiz;
        }
        state.currentQuiz = updatedQuiz;
        state.message = action.payload.message || 'Quiz updated successfully';
      })
      .addCase(updateQuiz.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      // Delete Quiz
      .addCase(deleteQuiz.pending, (state) => {
        state.isLoading = true;
        state.isError = false;
        state.message = '';
      })
      .addCase(deleteQuiz.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.quizzes = state.quizzes.filter(q => q._id !== action.payload.quizId);
        state.message = action.payload.message || 'Quiz deleted successfully';
      })
      .addCase(deleteQuiz.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      });
  },
});

export const { reset, clearCurrentQuiz } = quizSlice.actions;
export default quizSlice.reducer;
