import { Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Login from '../pages/Login';
import Register from '../pages/Register';
import Dashboard from '../pages/dashboard';
import QuizList from '../pages/quiz/QuizList';
import QuizForm from '../pages/quiz/QuizForm';
import QuizDetail from '../pages/quiz/QuizDetail';

const AppRoutes = () => {
  const { user } = useSelector((state) => state.auth);

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={!user ? <Login /> : <Navigate to="/dashboard" />} />
      <Route path="/register" element={!user ? <Register /> : <Navigate to="/dashboard" />} />
      
      {/* Protected Routes */}
      <Route path="/dashboard" element={user ? <Dashboard /> : <Navigate to="/login" />} />
      
      {/* Quiz Routes */}
      <Route path="/quizzes" element={user ? <QuizList /> : <Navigate to="/login" />} />
      <Route path="/quizzes/create" element={user ? <QuizForm /> : <Navigate to="/login" />} />
      <Route path="/quizzes/edit/:id" element={user ? <QuizForm /> : <Navigate to="/login" />} />
      <Route path="/quizzes/:id" element={user ? <QuizDetail /> : <Navigate to="/login" />} />
      
      {/* Default Route */}
      <Route path="/" element={<Navigate to={user ? '/dashboard' : '/login'} />} />
    </Routes>
  );
};

export default AppRoutes;
