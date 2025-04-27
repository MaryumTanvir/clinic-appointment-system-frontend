import { Routes, Route, Navigate } from 'react-router-dom';
import Login from '../pages/auth/Login';
import Signup from '../pages/auth/Signup';
import NotFound from '../pages/NotFound';
import Dashboard from '../pages/admin/Dashboard'; // Import your Dashboard
import { useAuth } from '../hooks/useAuth';
import ManageDoctors from '../pages/admin/ManageDoctors'; // <<< Import it at the top
import DoctorRequests from '../pages/admin/DoctorRequests';
import Shifts from '../pages/admin/Shifts';
import Settings from '../pages/admin/Settings';




function AppRoutes() {
  const { user, token } = useAuth();
  console.log('AppRoutes auth:', { user, token });

  return (
    <Routes>
      {/* Root / - Decide where to send */}
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

      {/* Auth Pages */}
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />

      {/* Admin Pages */}
      <Route path="/admin/dashboard" element={<Dashboard />} />
     
      <Route path="/admin/manage-doctors" element={<ManageDoctors />} />
      <Route path ="admin/doctor-requests" element ={<DoctorRequests/>} />
      <Route path ="admin/shifts" element ={<Shifts/>} />
      <Route path ="admin/settings" element ={<Settings/>} />
     

      {/* 404 */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default AppRoutes;
