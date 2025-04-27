import { Routes, Route, Navigate } from 'react-router-dom';
import Login from '../pages/auth/Login';
import Signup from '../pages/auth/Signup';
import NotFound from '../pages/NotFound';
import { useAuth } from '../hooks/useAuth';

function AppRoutes() {
  const { user, token } = useAuth();
  console.log('AppRoutes auth:', { user, token });

  return (
    <Routes>
      <Route
        path="/"
        element={
          token && user ? (
            <Navigate to={`/${user.role}/home`} replace />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default AppRoutes;