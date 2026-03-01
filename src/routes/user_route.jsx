import { Route, Navigate } from 'react-router-dom';
import Login from '../pages/Login';
import Register from '../pages/Register';
import Dashboard from '../pages/dashboard';
import UserList from '../pages/UserList';
import Profile from '../pages/auth/profile';

import ProtectedRoute from './protected_route';
import DashboardLayout from '../components/DashboardLayout';

const UserRoutes = ({ user }) => {
  return (
    <>
      {/* Public Routes - No sidebar */}
      <Route path="/login" element={!user ? <Login /> : <Navigate to="/dashboard" />} />
      <Route path="/register" element={!user ? <Register /> : <Navigate to="/dashboard" />} />

      {/* Protected Routes with Sidebar */}
      <Route element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/users" element={<UserList />} />
        <Route path="/profile" element={<Profile />} />
      </Route>
    </>
  );
};

export default UserRoutes;
