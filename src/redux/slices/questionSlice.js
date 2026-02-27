import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import questionService from '../../services/question_service';

const initialState = {
  questions: [],
  currentQuestion: null,
  isLoading: false,
  isSuccess: false,
  isCreateSuccess: false,
  isUpdateSuccess: false,
  isDeleteSuccess: false,
  isError: false,
  message: '',
};

// Get all questions for a quiz
export const getQuestionsByQuiz = createAsyncThunk(
  'question/getByQuiz',
  async (quizId, thunkAPI) => {
    try {
      const response = await questionService.getQuestionsByQuiz(quizId);
      return response;
    } catch (error) {
      const message = error.message || 'Failed to fetch questions';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Get single question by ID
export const getQuestionById = createAsyncThunk(
  'question/getById',
  async (questionId, thunkAPI) => {
    try {
      const response = await questionService.getQuestionById(questionId);
      return response;
    } catch (error) {
      const message = error.message || 'Failed to fetch question';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Create new question
export const createQuestion = createAsyncThunk(
  'question/create',
  async (questionData, thunkAPI) => {
    try {
      const response = await questionService.createQuestion(questionData);
      return response;
    } catch (error) {
      const message = error.message || 'Failed to create question';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Update question
export const updateQuestion = createAsyncThunk(
  'question/update',
  async ({ questionId, questionData }, thunkAPI) => {
    try {
      const response = await questionService.updateQuestion(questionId, questionData);
      return response;
    } catch (error) {
      const message = error.message || 'Failed to update question';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Delete question
export const deleteQuestion = createAsyncThunk(
  'question/delete',
  async (questionId, thunkAPI) => {
    try {
      const response = await questionService.deleteQuestion(questionId);
      return { ...response, questionId };
    } catch (error) {
      const message = error.message || 'Failed to delete question';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

const questionSlice = createSlice({
  name: 'question',
  initialState,
  reducers: {
    reset: (state) => {
      state.isLoading = false;
      state.isSuccess = false;
      state.isCreateSuccess = false;
      state.isUpdateSuccess = false;
      state.isDeleteSuccess = false;
      state.isError = false;
      state.message = '';
    },
    clearCurrentQuestion: (state) => {
      state.currentQuestion = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Get Questions By Quiz
      .addCase(getQuestionsByQuiz.pending, (state) => {
        state.isLoading = true;
        state.isError = false;
        state.message = '';
      })
      .addCase(getQuestionsByQuiz.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.questions = action.payload;
      })
      .addCase(getQuestionsByQuiz.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      // Get Question By Id
      .addCase(getQuestionById.pending, (state) => {
        state.isLoading = true;
        state.isError = false;
        state.message = '';
      })
      .addCase(getQuestionById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.currentQuestion = action.payload;
      })
      .addCase(getQuestionById.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      // Create Question
      .addCase(createQuestion.pending, (state) => {
        state.isLoading = true;
        state.isError = false;
        state.isCreateSuccess = false;
        state.message = '';
      })
      .addCase(createQuestion.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.isCreateSuccess = true;
        state.questions.push(action.payload.question);
        state.message = action.payload.message || 'Question created successfully';
      })
      .addCase(createQuestion.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      // Update Question
      .addCase(updateQuestion.pending, (state) => {
        state.isLoading = true;
        state.isError = false;
        state.isUpdateSuccess = false;
        state.message = '';
      })
      .addCase(updateQuestion.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.isUpdateSuccess = true;
        const updatedQuestion = action.payload.question;
        const index = state.questions.findIndex(q => q._id === updatedQuestion._id);
        if (index !== -1) {
          state.questions[index] = updatedQuestion;
        }
        state.currentQuestion = updatedQuestion;
        state.message = action.payload.message || 'Question updated successfully';
      })
      .addCase(updateQuestion.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      // Delete Question
      .addCase(deleteQuestion.pending, (state) => {
        state.isLoading = true;
        state.isError = false;
        state.isDeleteSuccess = false;
        state.message = '';
      })
      .addCase(deleteQuestion.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.isDeleteSuccess = true;
        state.questions = state.questions.filter(q => q._id !== action.payload.questionId);
        state.message = action.payload.message || 'Question deleted successfully';
      })
      .addCase(deleteQuestion.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      });
  },
});

export const { reset, clearCurrentQuestion } = questionSlice.actions;
export default questionSlice.reducer;
