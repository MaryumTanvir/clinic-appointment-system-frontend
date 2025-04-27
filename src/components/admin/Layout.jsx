import React from 'react';
import { Home, Users, Calendar, Settings, LogOut, FileText } from 'lucide-react';

import logo from '../../assets/images/logo.png';

const Layout = ({ children }) => {
  return (
    <div className="flex h-screen bg-gradient-to-br from-[#B9E5E8] to-[#7AB2D3]">
      {/* Sidebar */}
      <div className="w-80 bg-[#4A628A] text-white p-6 flex flex-col">
        {/* Logo */}
        <div className="flex items-center mb-12">
          <div className="w-12 h-12 rounded-full bg-white overflow-hidden mr-3">
            {/* Replace with your actual import path */}
            <img src={logo} alt="Ikigai logo" className="w-full h-full object-cover rounded-full" />
          </div>
          <h1 className="text-3xl font-bold pt-4">Ikigai</h1>
        </div>

        {/* Navigation */}
        <nav className="flex-1 flex flex-col gap-4">
          <NavItem icon={<Home size={20} />} label="Dashboard" active />
          <NavItem icon={<Users size={20} />} label="Manage Doctors" />
          <NavItem icon={<FileText size={20} />} label="Doctor Requests" />
          <NavItem icon={<Calendar size={20} />} label="Shifts" />
          <NavItem icon={<Settings size={20} />} label="Settings" />
        </nav>

        {/* Logout */}
        <NavItem icon={<LogOut size={20} />} label="Logout" />
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