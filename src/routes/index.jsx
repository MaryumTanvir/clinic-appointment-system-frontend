import { Routes, Route, Navigate } from 'react-router-dom';
import Login from '../pages/auth/Login';
import Signup from '../pages/auth/Signup';
import NotFound from '../pages/NotFound';
import Dashboard from '../pages/admin/Dashboard'; // Import your Dashboard
import { useAuth } from '../hooks/useAuth';

function AppRoutes() {
  const { user, token } = useAuth();
  console.log('AppRoutes auth:', { user, token });

  return (
    <Routes>
      {/* Root Route */}
      <Route
        path="/"
        element={
          token && user ? (
            user.role === 'admin' ? (
              <Navigate to="/admin/dashboard" replace />
            ) : (
              <Navigate to={`/${user.role}/home`} replace />
            )
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />

      {/* Login & Signup */}
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />

      {/* Admin Dashboard */}
      <Route path="/admin/dashboard" element={<Dashboard />} />

      {/* Catch All */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default AppRoutes;
