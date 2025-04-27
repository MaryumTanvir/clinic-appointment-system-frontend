import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Calendar, CheckCircle, MessageSquare, User, Briefcase, Mail } from 'lucide-react';
import Layout from '../../components/doctor/Layout';

const DoctorDashboard = () => {
  const [doctor, setDoctor] = useState(null);
  const [scheduledAppointmentsCount, setScheduledAppointmentsCount] = useState(0);
  const [completedAppointmentsCount, setCompletedAppointmentsCount] = useState(0);
  const [pendingFeedbackCount, setPendingFeedbackCount] = useState(0);

  useEffect(() => {
    const fetchDoctor = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('http://localhost:5000/api/doctors/profile', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        setDoctor(response.data.data);
      } catch (error) {
        console.error('Failed to fetch doctor profile:', error);
      }
    };

    const fetchAppointments = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('http://localhost:5000/api/doctors/appointments', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        const appointments = response.data.data;
        setScheduledAppointmentsCount(
          appointments.filter((appointment) => appointment.status === 'scheduled').length
        );
        setCompletedAppointmentsCount(
          appointments.filter((appointment) => appointment.status === 'completed').length
        );
      } catch (error) {
        console.error('Failed to fetch appointments:', error);
      }
    };

    const fetchFeedback = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('http://localhost:5000/api/doctors/feedback', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        const feedbacks = response.data.data;
        setPendingFeedbackCount(
          feedbacks.filter((feedback) => feedback.status === 'pending').length
        );
      } catch (error) {
        console.error('Failed to fetch feedback:', error);
      }
    };

    fetchDoctor();
    fetchAppointments();
    fetchFeedback();
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
      <div className="bg-white rounded-xl p-8 mb-8 shadow-lg border border-gray-200">
        <div className="flex items-center mb-6">
          <div className="mr-4">
            <div className="w-12 h-12 bg-[#B9E5E8] rounded-lg flex items-center justify-center">
              <User size={28} className="text-[#4A628A]" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-[#4A628A]">My Information</h2>
        </div>

        <div className="flex">
          <div className="flex-1 border-r border-gray-400 px-4">
            <div className="flex items-center mb-2">
              <Briefcase size={20} className="text-[#4A628A] mr-2" />
              <h3 className="text-lg font-semibold text-gray-700">Specialization</h3>
            </div>
            <p className="text-lg text-gray-600">{doctor?.specialty || '...'}</p>
          </div>

          <div className="flex-1 border-r border-gray-400 px-8">
            <div className="flex items-center mb-2">
              <Calendar size={20} className="text-[#4A628A] mr-2" />
              <h3 className="text-lg font-semibold text-gray-700">Experience</h3>
            </div>
            <p className="text-lg text-gray-600">{doctor?.credentials || '...'} years</p>
          </div>

          <div className="flex-1 px-6">
            <div className="flex items-center mb-2">
              <Mail size={20} className="text-[#4A628A] mr-2" />
              <h3 className="text-lg font-semibold text-gray-700">Email</h3>
            </div>
            <p className="text-lg text-gray-600">{doctor?.email || '...'}</p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-6">
        {/* Scheduled Appointments Card */}
        <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
          <div className="flex items-center mb-4">
            <div className="mr-4">
              <div className="w-12 h-12 bg-[#B9E5E8] rounded-lg flex items-center justify-center">
                <Calendar size={28} className="text-[#4A628A]" />
              </div>
            </div>
            <h2 className="text-2xl font-bold text-[#4A628A]">Scheduled Appointments</h2>
          </div>
          <p className="text-xl text-gray-700">{scheduledAppointmentsCount} scheduled</p>
        </div>

        {/* Completed Appointments Card */}
        <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
          <div className="flex items-center mb-4">
            <div className="mr-4">
              <div className="w-12 h-12 bg-[#B9E5E8] rounded-lg flex items-center justify-center">
                <CheckCircle size={28} className="text-[#4A628A]" />
              </div>
            </div>
            <h2 className="text-2xl font-bold text-[#4A628A]">Completed Appointments</h2>
          </div>
          <p className="text-xl text-gray-700">{completedAppointmentsCount} completed</p>
        </div>

        {/* Pending Feedback Card */}
        <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
          <div className="flex items-center mb-4">
            <div className="mr-4">
              <div className="w-12 h-12 bg-[#B9E5E8] rounded-lg flex items-center justify-center">
                <MessageSquare size={28} className="text-[#4A628A]" />
              </div>
            </div>
            <h2 className="text-2xl font-bold text-[#4A628A]">Pending Feedback</h2>
          </div>
          <p className="text-xl text-gray-700">{pendingFeedbackCount} pending</p>
        </div>
      </div>
    </Layout>
  );
};

export default DoctorDashboard;
