import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Stethoscope, FileText } from 'lucide-react';
import Layout from '../../components/admin/Layout';

const Dashboard = () => {
  const [admin, setAdmin] = useState(null);
  const [doctorRequestsCount, setDoctorRequestsCount] = useState(0);
  const [doctorsCount, setDoctorsCount] = useState(0);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const token = localStorage.getItem('token');
        const headers = { Authorization: `Bearer ${token}` };

        // Fetch admin profile
        const adminRes = await axios.get('http://localhost:5000/api/admin/profile', { headers });
        setAdmin(adminRes.data.data);

        // Fetch pending doctor requests
        const requestsRes = await axios.get('http://localhost:5000/api/admin/doctor-requests', { headers });
        const pendingRequests = requestsRes.data.data.filter(req => req.status === 'pending');
        setDoctorRequestsCount(pendingRequests.length);

        // Fetch all doctors
        const doctorsRes = await axios.get('http://localhost:5000/api/admin/doctors', { headers });
        setDoctorsCount(doctorsRes.data.data.length);

      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      }
    };

    fetchDashboardData();
  }, []);

  return (
    <Layout>
      {/* Header */}
      <div className="mb-12">
        <h1 className="text-4xl pt-2.5 font-bold">
          Hello, {admin ? `${admin.firstName} ${admin.lastName}` : '...'}
        </h1>
        <p className="text-gray-600 text-lg">Welcome to the appointment management system!</p>
      </div>

      {/* My Information Card */}
      <div className="bg-[#B9E5E8] rounded-xl p-8 mb-8">
        <h2 className="text-3xl font-bold text-center mb-6">My Information</h2>
        <div className="flex">
          <div className="flex-1 border-r border-gray-400 px-4">
            <h3 className="text-xl font-semibold mb-2">Department</h3>
            <p className="text-lg">{admin?.department || '...'}</p>
          </div>
          <div className="flex-1 border-r border-gray-400 px-8">
            <h3 className="text-xl font-semibold mb-2">Designation</h3>
            <p className="text-lg">{admin?.designation || '...'}</p>
          </div>
          <div className="flex-1 px-6">
            <h3 className="text-xl font-semibold mb-2">Email</h3>
            <p className="text-lg">{admin?.email || '...'}</p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-8">
        {/* Approval Requests Card */}
        <div className="bg-[#B9E5E8] rounded-xl p-6">
          <div className="flex items-center mb-6">
            <div className="mr-4">
              <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center">
                <FileText size={28} className="text-[#4A628A]" />
              </div>
            </div>
            <h2 className="text-3xl font-bold">Approval Requests</h2>
          </div>
          <p className="text-2xl">{doctorRequestsCount} doctor requests</p>
        </div>

        {/* Total Doctors Card */}
        <div className="bg-[#B9E5E8] rounded-xl p-6">
          <div className="flex items-center mb-6">
            <div className="mr-4">
              <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center">
                <Stethoscope size={28} className="text-[#4A628A]" />
              </div>
            </div>
            <h2 className="text-3xl font-bold">Total Doctors</h2>
          </div>
          <p className="text-2xl">{doctorsCount} doctors in the system</p>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;
