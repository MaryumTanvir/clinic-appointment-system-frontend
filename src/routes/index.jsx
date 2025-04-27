import { Routes, Route, Navigate } from 'react-router-dom';
import Login from '../pages/auth/Login';
import Signup from '../pages/auth/Signup';
import NotFound from '../pages/NotFound';
import Dashboard from '../pages/admin/Dashboard'; // Import your Dashboard
import DoctorDashboard from '../pages/doctor/DoctorDashboard';
import PatientDashboard from '../pages/patient/Dashboard';
import PatientAppointments from '../pages/patient/Appointments';
import PatientDoctors from '../pages/patient/Doctors';
import PatientPayments from '../pages/patient/Payments';
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
              <Navigate to={`/${user.role}/dashboard`} replace />
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

      {/* Doctor Dashboard */}
      <Route path="/doctor/dashboard" element={<DoctorDashboard />} />

      {/* Patient Dashboard */}
      <Route path="/patient/dashboard" element={<PatientDashboard />} />
      <Route path="/patient/appointments" element={<PatientAppointments />} />
      <Route path="/patient/doctors" element={<PatientDoctors />} />
      <Route path="/patient/payments" element={<PatientPayments />} />
          
      {/* Catch All */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default AppRoutes;
