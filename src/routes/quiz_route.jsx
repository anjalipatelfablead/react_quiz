// routes/QuizRoutes.jsx
import { Route } from "react-router-dom";
import QuizList from "../pages/quiz/QuizList";
import QuizForm from "../pages/quiz/QuizForm";
import QuizDetail from "../pages/quiz/QuizDetail";
import QuestionForm from "../pages/question/QuestionForm";
import QuestionTest from "../pages/question/QuestionTest";
import QuestionReview from "../pages/question/QuestionReview";
import ProtectedRoute from "./protected_route";
import DashboardLayout from "../components/DashboardLayout";

const QuizRoutes = () => {
  return (
    <>
      <Route element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
        <Route path="/quizzes" element={<QuizList />} />
        <Route path="/quizzes/create" element={<QuizForm />} />
        <Route path="/quizzes/edit/:id" element={<QuizForm />} />
        <Route path="/quizzes/:id" element={<QuizDetail />} />
        <Route path="/quizzes/:quizId/questions" element={<QuestionForm />} />
        <Route path="/quizzes/:quizId/review" element={<QuestionReview />} />
        <Route path="/quizzes/:quizId/review/:resultId" element={<QuestionReview />} />
      </Route>

      {/* Test page without sidebar */}
      <Route
        path="/quizzes/:quizId/take"
        element={
          <ProtectedRoute>
            <QuestionTest />
          </ProtectedRoute>
        }
      />
    </>
  );
};

export default QuizRoutes;