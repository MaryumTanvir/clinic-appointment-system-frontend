import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Home, Users, Calendar, Settings, LogOut, FileText } from 'lucide-react';
import logo from '../../assets/images/logo.png';

const Layout = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();

  // Navigation items
  const navItems = [
    { label: 'Dashboard', icon: <Home size={20} />, path: '/admin/dashboard' },
    { label: 'Manage Doctors', icon: <Users size={20} />, path: '/admin/manage-doctors' },
    { label: 'Doctor Requests', icon: <FileText size={20} />, path: '/admin/doctor-requests' },
    { label: 'Shifts', icon: <Calendar size={20} />, path: '/admin/shifts' },
    { label: 'Settings', icon: <Settings size={20} />, path: '/admin/settings' },
  ];
  

  const handleLogout = () => {
    localStorage.removeItem('token'); // Clear the token
    localStorage.removeItem('role'); // Clear the role if stored
    navigate('/login'); // Redirect to login page
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
          {navItems.map((item) => (
            <NavItem
              key={item.label}
              icon={item.icon}
              label={item.label}
              active={location.pathname === item.path}
              onClick={() => navigate(item.path)}
            />
          ))}
        </nav>

        {/* Logout */}
        <div onClick={handleLogout}>
          <NavItem icon={<LogOut size={20} />} label="Logout" />
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-8 overflow-y-auto">
        {children}
      </div>
    </div>
  );
};

const NavItem = ({ icon, label, active, onClick }) => {
  return (
    <div
      onClick={onClick}
      className={`flex items-center p-3 rounded-lg ${
        active ? 'bg-[#7AB2D3] bg-opacity-30' : 'hover:bg-[#7AB2D3] hover:bg-opacity-20'
      } cursor-pointer transition-all`}
    >
      <div className="mr-3">{icon}</div>
      <span className="text-lg">{label}</span>
    </div>
  );
};

export default Layout;
