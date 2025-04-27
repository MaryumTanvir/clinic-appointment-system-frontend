import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Layout from '../../components/admin/Layout';

const DoctorDashboard = () => {
  const [doctor, setDoctor] = useState(null);

  useEffect(() => {
    const fetchDoctor = async () => {
      try {
        const token = localStorage.getItem('token'); // Assuming you saved the JWT here during login
        const response = await axios.get('http://localhost:5000/api/doctor/profile', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        setDoctor(response.data.data);
      } catch (error) {
        console.error('Failed to fetch doctor profile:', error);
      }
    };

    fetchDoctor();
  }, []);

  return (
    <Layout>
      {/* Header */}
      <div className="mb-12">
        <h1 className="text-4xl pt-2.5 font-bold">
          Hello, {doctor ? `${doctor.firstName} ${doctor.lastName}` : '...'}
        </h1>
        <p className="text-gray-600 text-lg">Welcome to your dashboard!</p>
      </div>

      {/* My Information Card */}
      <div className="bg-[#B9E5E8] rounded-xl p-8 mb-8">
        <h2 className="text-3xl font-bold text-center mb-6">My Information</h2>

        <div className="flex">
          <div className="flex-1 border-r border-gray-400 px-4">
            <h3 className="text-xl font-semibold mb-2">Specialization</h3>
            <p className="text-lg">{doctor?.specialization || '...'}</p>
          </div>

          <div className="flex-1 border-r border-gray-400 px-8">
            <h3 className="text-xl font-semibold mb-2">Experience</h3>
            <p className="text-lg">{doctor?.experience || '...'} years</p>
          </div>

          <div className="flex-1 px-6">
            <h3 className="text-xl font-semibold mb-2">Email</h3>
            <p className="text-lg">{doctor?.email || '...'}</p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-8">
        {/* Appointments Card */}
        <div className="bg-[#B9E5E8] rounded-xl p-6">
          <h2 className="text-3xl font-bold mb-4">Appointments</h2>
          <p className="text-2xl">You have 20 upcoming appointments</p>
        </div>

        {/* Feedback Card */}
        <div className="bg-[#B9E5E8] rounded-xl p-6">
          <h2 className="text-3xl font-bold mb-4">Feedback</h2>
          <p className="text-2xl">You have 15 new feedback messages</p>
        </div>
      </div>
    </Layout>
  );
};

export default DoctorDashboard;
