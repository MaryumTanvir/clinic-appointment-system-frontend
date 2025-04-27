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
import PatientFeedback from '../pages/patient/Feedback';
import PatientProfile from '../pages/patient/Profile.jsx';

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

      {/* Doctor Routes */}
      <Route path="/doctor/dashboard" element={<DoctorDashboard />} />

      {/* Patient Dashboard */}
      <Route path="/patient/dashboard" element={<PatientDashboard />} />
      <Route path="/patient/appointments" element={<PatientAppointments />} />
      <Route path="/patient/doctors" element={<PatientDoctors />} />
      <Route path="/patient/payments" element={<PatientPayments />} />
      <Route path="/patient/feedback" element={<PatientFeedback />} />
      <Route path="/patient/profile" element={<PatientProfile />} />
          
      {/* Doctor Feedback */}
      <Route path="/doctor/feedback" element={<Feedback />} />
      <Route path="/doctor/shifts" element={<Shifts />} />
      <Route path="/doctor/profile" element={<Profile />} />

      {/* Catch All */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default AppRoutes;
