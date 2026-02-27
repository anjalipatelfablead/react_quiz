// routes/QuizRoutes.jsx
import { Route } from "react-router-dom";
import QuizList from "../pages/quiz/QuizList";
import QuizForm from "../pages/quiz/QuizForm";
import QuizDetail from "../pages/quiz/QuizDetail";
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
    </>
  );
};

export default QuizRoutes;