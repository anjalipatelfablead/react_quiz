import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import resultService from '../../services/result_service';

const initialState = {
  results: [],
  currentResult: null,
  isLoading: false,
  isSuccess: false,
  isSubmitSuccess: false,
  isError: false,
  message: '',
};

// Submit quiz and create result
export const submitQuiz = createAsyncThunk(
  'result/submitQuiz',
  async ({ quizId, answers, timeTaken }, thunkAPI) => {
    try {
      const response = await resultService.submitQuiz(quizId, answers, timeTaken);
      return response;
    } catch (error) {
      const message = error.message || 'Failed to submit quiz';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Get all results for current user
export const getUserResults = createAsyncThunk(
  'result/getUserResults',
  async (_, thunkAPI) => {
    try {
      const response = await resultService.getUserResults();
      return response;
    } catch (error) {
      const message = error.message || 'Failed to fetch results';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Get all results (Admin only)
export const getAllResults = createAsyncThunk(
  'result/getAllResults',
  async (_, thunkAPI) => {
    try {
      const response = await resultService.getAllResults();
      return response;
    } catch (error) {
      const message = error.message || 'Failed to fetch all results';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Get single result by ID
export const getResultById = createAsyncThunk(
  'result/getById',
  async (resultId, thunkAPI) => {
    try {
      const response = await resultService.getResultById(resultId);
      return response;
    } catch (error) {
      const message = error.message || 'Failed to fetch result';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Delete result
export const deleteResult = createAsyncThunk(
  'result/delete',
  async (resultId, thunkAPI) => {
    try {
      const response = await resultService.deleteResult(resultId);
      return { ...response, resultId };
    } catch (error) {
      const message = error.message || 'Failed to delete result';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

const resultSlice = createSlice({
  name: 'result',
  initialState,
  reducers: {
    reset: (state) => {
      state.isLoading = false;
      state.isSuccess = false;
      state.isSubmitSuccess = false;
      state.isError = false;
      state.message = '';
    },
    clearCurrentResult: (state) => {
      state.currentResult = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Submit Quiz
      .addCase(submitQuiz.pending, (state) => {
        state.isLoading = true;
        state.isError = false;
        state.isSubmitSuccess = false;
        state.message = '';
      })
      .addCase(submitQuiz.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.isSubmitSuccess = true;
        state.currentResult = action.payload.result;
        state.results.unshift(action.payload.result);
        state.message = action.payload.message || 'Quiz submitted successfully';
      })
      .addCase(submitQuiz.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      // Get User Results
      .addCase(getUserResults.pending, (state) => {
        state.isLoading = true;
        state.isError = false;
        state.message = '';
      })
      .addCase(getUserResults.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.results = action.payload;
      })
      .addCase(getUserResults.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      // Get All Results (Admin)
      .addCase(getAllResults.pending, (state) => {
        state.isLoading = true;
        state.isError = false;
        state.message = '';
      })
      .addCase(getAllResults.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.results = action.payload;
      })
      .addCase(getAllResults.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      // Get Result By Id
      .addCase(getResultById.pending, (state) => {
        state.isLoading = true;
        state.isError = false;
        state.message = '';
      })
      .addCase(getResultById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.currentResult = action.payload;
      })
      .addCase(getResultById.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      // Delete Result
      .addCase(deleteResult.pending, (state) => {
        state.isLoading = true;
        state.isError = false;
        state.message = '';
      })
      .addCase(deleteResult.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.results = state.results.filter(r => r._id !== action.payload.resultId);
        state.message = action.payload.message || 'Result deleted successfully';
      })
      .addCase(deleteResult.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      });
  },
});

export const { reset, clearCurrentResult } = resultSlice.actions;
export default resultSlice.reducer;
