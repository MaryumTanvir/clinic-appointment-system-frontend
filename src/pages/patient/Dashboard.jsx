import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Calendar, FileText } from 'lucide-react';
import Layout from '../../components/Layout';

const Dashboard = () => {
  const [patient, setPatient] = useState(null);

  useEffect(() => {
    const fetchPatient = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('http://localhost:5000/api/patient/profile', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        setPatient(response.data.data);
      } catch (error) {
        console.error('Failed to fetch patient profile:', error);
      }
    };

    fetchPatient();
  }, []);

  return (
    <Layout role="patient">
      {/* Header */}
      <div className="mb-12">
        <h1 className="text-4xl pt-2.5 font-bold">
          Hello, {patient ? `${patient.firstName} ${patient.lastName}` : '...'}
        </h1>
        <p className="text-gray-600 text-lg">Welcome to the appointment management system!</p>
      </div>

      {/* My Information Card */}
      <div className="bg-[#B9E5E8] rounded-xl p-8 mb-8">
        <h2 className="text-3xl font-bold text-center mb-6">My Information</h2>

        <div className="flex">
          <div className="flex-1 border-r border-gray-400 px-4">
            <h3 className="text-xl font-semibold mb-2">Email</h3>
            <p className="text-lg">{patient?.email || '...'}</p>
          </div>

          <div className="flex-1 border-r border-gray-400 px-8">
            <h3 className="text-xl font-semibold mb-2">Age</h3>
            <p className="text-lg">{patient?.age || '...'}</p>
          </div>

          <div className="flex-1 px-6">
            <h3 className="text-xl font-semibold mb-2">Phone</h3>
            <p className="text-lg">{patient?.phone || '...'}</p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-8">
        {/* Upcoming Appointments Card */}
        <div className="bg-[#B9E5E8] rounded-xl p-6">
          <div className="flex items-center mb-6">
            <div className="mr-4">
              <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center">
                <Calendar size={28} className="text-[#4A628A]" />
              </div>
            </div>
            <h2 className="text-3xl font-bold">Upcoming Appointments</h2>
          </div>
          <p className="text-2xl">5 upcoming appointments</p>
        </div>

        {/* Past Appointments Card */}
        <div className="bg-[#B9E5E8] rounded-xl p-6">
          <div className="flex items-center mb-6">
            <div className="mr-4">
              <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center">
                <FileText size={28} className="text-[#4A628A]" />
              </div>
            </div>
            <h2 className="text-3xl font-bold">Past Appointments</h2>
          </div>
          <p className="text-2xl">10 past appointments</p>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;