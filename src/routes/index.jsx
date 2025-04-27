import { Routes, Route, Navigate } from 'react-router-dom';
import Login from '../pages/auth/Login';
import Signup from '../pages/auth/Signup';
import NotFound from '../pages/NotFound';
import Dashboard from '../pages/admin/Dashboard'; // Import your Dashboard
import DoctorDashboard from '../pages/doctor/DoctorDashboard';
import Feedback from '../pages/doctor/Feedback';
import Shifts from '../pages/doctor/Shifts';
import Profile from '../pages/doctor/Profile'; 
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
            ) : user.role === 'doctor' ? (
              <Navigate to="/doctor/dashboard" replace />
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

      {/* Doctor Routes */}
      <Route path="/doctor/dashboard" element={<DoctorDashboard />} />
      <Route path="/doctor/feedback" element={<Feedback />} />
      <Route path="/doctor/shifts" element={<Shifts />} />
      <Route path="/doctor/profile" element={<Profile />} />

      {/* Catch All */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default AppRoutes;
