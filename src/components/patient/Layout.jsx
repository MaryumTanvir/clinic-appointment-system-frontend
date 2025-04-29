import React from 'react';
import { Home, Calendar, User, Settings, LogOut, Users, MessageSquare, FileText, Wallet } from 'lucide-react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import logo from '../../assets/images/logo.png';

const Layout = ({ children, role }) => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  const navItems = [
    { icon: <Home size={20} />, label: 'Dashboard', path: '/patient/dashboard' },
    { icon: <Calendar size={20} />, label: 'Appointments', path: '/patient/appointments' },
    { icon: <Users size={20} />, label: 'Doctors', path: '/patient/doctors' },
    { icon: <Wallet size={20} />, label: 'Payments', path: '/patient/payments' },
    { icon: <MessageSquare size={20} />, label: 'Feedback', path: '/patient/feedback' },
    { icon: <User size={20} />, label: 'Profile', path: '/patient/profile' },
  ]

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-[#B9E5E8] to-[#7AB2D3]">
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
            <Link to={item.path} key={item.label}>
              <NavItem
                icon={item.icon}
                label={item.label}
                active={location.pathname === item.path}
              />
            </Link>
          ))}
          <div onClick={handleLogout}>
            <NavItem icon={<LogOut size={20} />} label="Logout" />
          </div>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-8">
        {children}
      </div>
    </div>
  );
};

// Navigation Item Component
const NavItem = ({ icon, label, active }) => {
  return (
    <div className={`flex items-center p-3 rounded-lg ${active ? 'bg-[#7AB2D3] bg-opacity-30' : 'hover:bg-[#7AB2D3] hover:bg-opacity-20'} cursor-pointer transition-all`}>
      <div className="mr-3">{icon}</div>
      <span className="text-lg">{label}</span>
    </div>
  );
};

export default Layout;