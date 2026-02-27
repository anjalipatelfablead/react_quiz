// routes/QuizRoutes.jsx
import { Route } from "react-router-dom";
import QuizList from "../pages/quiz/QuizList";
import QuizForm from "../pages/quiz/QuizForm";
import QuizDetail from "../pages/quiz/QuizDetail";
import QuestionForm from "../pages/question/QuestionForm";
import QuestionTest from "../pages/question/QuestionTest";
import QuestionReview from "../pages/question/QuestionReview";
import ProtectedRoute from "./protected_route";

const QuizRoutes = () => {
  return (
    <>
      <Route
        path="/quizzes"
        element={
          <ProtectedRoute>
            <QuizList />
          </ProtectedRoute>
        }
      />

      <Route
        path="/quizzes/create"
        element={
          <ProtectedRoute>
            <QuizForm />
          </ProtectedRoute>
        }
      />

      <Route
        path="/quizzes/edit/:id"
        element={
          <ProtectedRoute>
            <QuizForm />
          </ProtectedRoute>
        }
      />

      <Route
        path="/quizzes/:id"
        element={
          <ProtectedRoute>
            <QuizDetail />
          </ProtectedRoute>
        }
      />

      <Route
        path="/quizzes/:quizId/questions"
        element={
          <ProtectedRoute>
            <QuestionForm />
          </ProtectedRoute>
        }
      />

      <Route
        path="/quizzes/:quizId/take"
        element={
          <ProtectedRoute>
            <QuestionTest />
          </ProtectedRoute>
        }
      />

      <Route
        path="/quizzes/:quizId/review"
        element={
          <ProtectedRoute>
            <QuestionReview />
          </ProtectedRoute>
        }
      />
    </>
  );
};

export default QuizRoutes;