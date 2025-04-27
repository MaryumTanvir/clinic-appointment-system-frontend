import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, ClipboardList, Calendar, Settings, LogOut, FileText } from 'lucide-react';
import logo from '../../assets/images/logo.png';

const Layout = ({ children }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    navigate('/login');
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-[#B9E5E8] to-[#7AB2D3]">
      {/* Sidebar */}
      <div className="w-80 bg-[#4A628A] text-white p-6 flex flex-col">
        {/* Logo */}
        <div className="flex items-center mb-12">
          <div className="w-12 h-12 rounded-full bg-white overflow-hidden mr-3">
            <img src={logo} alt="Ikigai logo" className="w-full h-full object-cover rounded-full" />
          </div>
          <h1 className="text-3xl font-bold pt-4">Ikigai</h1>
        </div>

        {/* Navigation */}
        <nav className="flex-1 flex flex-col gap-4">
          <NavItem icon={<Home size={20} />} label="Dashboard" onClick={() => navigate('/doctor/dashboard')} />
          <NavItem icon={<ClipboardList size={20} />} label="Appointments" onClick={() => navigate('/doctor/appointments')} />
          <NavItem icon={<Calendar size={20} />} label="Shift Schedule" onClick={() => navigate('/doctor/shifts')} />
          <NavItem icon={<FileText size={20} />} label="Feedback" onClick={() => navigate('/doctor/feedback')} />
          <NavItem icon={<Settings size={20} />} label="Settings" onClick={() => navigate('/doctor/profile')} />
        </nav>

        {/* Logout */}
        <div onClick={handleLogout}>
          <NavItem icon={<LogOut size={20} />} label="Logout" />
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-8">
        {children}
      </div>
    </div>
  );
};

// Navigation Item Component
const NavItem = ({ icon, label, onClick }) => {
  return (
    <div
      className="flex items-center p-3 rounded-lg hover:bg-[#7AB2D3] hover:bg-opacity-20 cursor-pointer transition-all"
      onClick={onClick}
    >
      <div className="mr-3">{icon}</div>
      <span className="text-lg">{label}</span>
    </div>
  );
};

export default Layout;