import { Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Login from '../pages/Login';
import Register from '../pages/Register';

const AppRoutes = () => {
  const { user } = useSelector((state) => state.auth);

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={!user ? <Login /> : <Navigate to={user.role === 'admin' ? '/admin/dashboard' : '/dashboard'} />} />
      <Route path="/register" element={!user ? <Register /> : <Navigate to={user.role === 'admin' ? '/admin/dashboard' : '/dashboard'} />} />
      
      {/* Default Route */}
      <Route path="/" element={<Navigate to={user ? (user.role === 'admin' ? '/admin/dashboard' : '/dashboard') : '/login'} />} />
    </Routes>
  );
};

export default AppRoutes;
