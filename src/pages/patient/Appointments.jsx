import React, { useState } from 'react';
import { useAppointments } from '../../hooks/useAppointments';
import AppointmentCard from '../../components/patient/AppointmentCard';
import { Appointment } from '../../types/appointment';

const Appointments: React.FC = () => {
  const [timeFilter, setTimeFilter] = useState<'past' | 'today' | 'future'>('future');
  const { data, isLoading, error, refetch } = useAppointments(timeFilter);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold text-primary mb-6">My Appointments</h1>
      <div className="mb-6 flex space-x-4">
        <button
          onClick={() => setTimeFilter('past')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            timeFilter === 'past'
              ? 'bg-primary text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Past
        </button>
        <button
          onClick={() => setTimeFilter('today')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            timeFilter === 'today'
              ? 'bg-primary text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Today
        </button>
        <button
          onClick={() => setTimeFilter('future')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            timeFilter === 'future'
              ? 'bg-primary text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Future
        </button>
      </div>
      {isLoading && (
        <p className="text-center text-gray-500">Loading appointments...</p>
      )}
      {error && (
        <p className="text-center text-red-500">
          Error: {error.message || 'Failed to load appointments'}
        </p>
      )}
      {data && data.data.length === 0 && (
        <p className="text-center text-gray-500">
          No {timeFilter} appointments found.
        </p>
      )}
      {data && data.data.length > 0 && (
        <div className="grid gap-4">
          {data.data.map((appointment: Appointment) => (
            <AppointmentCard
              key={appointment._id}
              appointment={appointment}
              onUpdate={refetch} // Refresh appointments after cancel/reschedule
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Appointments;