import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Table, Button, message } from 'antd';
import { CalendarDays } from 'lucide-react'; // Import an icon for the header
import Layout from '../../components/doctor/Layout';

const Shifts = () => {
  const [shifts, setShifts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState('all'); // Default filter is 'all'

  useEffect(() => {
    const fetchShifts = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        const response = await axios.get(`http://localhost:5000/api/doctors/shifts?filter=${filter}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        setShifts(response.data.data);
      } catch (error) {
        console.error('Failed to fetch shifts:', error);
        message.error('Failed to load shifts.');
      } finally {
        setLoading(false);
      }
    };

    fetchShifts();
  }, [filter]);

  const calculateShiftStatus = (shift) => {
    const now = new Date();
    const shiftStart = new Date(shift.date);
    const shiftEnd = new Date(shift.endDate);

    const [startHour, startMinute] = shift.startTime.split(':').map(Number);
    const [endHour, endMinute] = shift.endTime.split(':').map(Number);

    shiftStart.setHours(startHour, startMinute, 0, 0);
    shiftEnd.setHours(endHour, endMinute, 0, 0);

    if (now < shiftStart) {
      const timeLeft = Math.ceil((shiftStart - now) / (1000 * 60)); // Time left in minutes
      return `${timeLeft} min left`;
    } else if (now >= shiftStart && now <= shiftEnd) {
      return 'Active';
    } else {
      return 'Completed';
    }
  };

  const columns = [
    {
      title: 'Date',
      dataIndex: 'date',
      key: 'date',
      render: (date) => new Date(date).toLocaleDateString()
    },
    {
      title: 'Start Time',
      dataIndex: 'startTime',
      key: 'startTime'
    },
    {
      title: 'End Time',
      dataIndex: 'endTime',
      key: 'endTime'
    },
    {
      title: 'Shift Location',
      dataIndex: 'location',
      key: 'location',
      render: (location) => <span className="text-gray-700">{location || 'N/A'}</span>
    },
    {
      title: 'Shift Type',
      dataIndex: 'shiftType',
      key: 'shiftType',
      render: (type) => <span className="text-gray-700">{type || 'N/A'}</span>
    },
    {
      title: 'Status',
      key: 'status',
      render: (_, record) => {
        const status = calculateShiftStatus(record);
        return (
          <span
            className={`px-2 py-1 rounded ${
              status === 'Active'
                ? 'bg-green-200 text-green-800'
                : status === 'Completed'
                ? 'bg-gray-200 text-gray-800'
                : 'bg-yellow-200 text-yellow-800'
            }`}
          >
            {status}
          </span>
        );
      }
    }
  ];

  return (
    <Layout>
      <div className="p-6 bg-[#B9E5E8] rounded-xl">
        {/* Header */}
        <div className="flex items-center mb-6">
        <div className="flex items-center justify-center w-14 h-14 bg-white rounded-lg shadow-md">
            <CalendarDays size={28} className="text-[#4A628A]" />
        </div>
        <h1 className="text-3xl font-bold text-[#4A628A] ml-4 leading-tight">
            Shifts
        </h1>
        </div>


        {/* Filter Buttons */}
        <div className="flex gap-4 mb-6">
          <Button
            type={filter === 'all' ? 'primary' : 'default'}
            onClick={() => setFilter('all')}
          >
            All
          </Button>
          <Button
            type={filter === 'past' ? 'primary' : 'default'}
            onClick={() => setFilter('past')}
          >
            Past
          </Button>
          <Button
            type={filter === 'today' ? 'primary' : 'default'}
            onClick={() => setFilter('today')}
          >
            Today
          </Button>
          <Button
            type={filter === 'future' ? 'primary' : 'default'}
            onClick={() => setFilter('future')}
          >
            Future
          </Button>
        </div>

        {/* Shifts Table */}
        <Table
          dataSource={shifts}
          columns={columns}
          rowKey="_id"
          loading={loading}
          pagination={{ pageSize: 5 }}
          bordered
          className="ant-table-fixed"
        />
      </div>
    </Layout>
  );
};

export default Shifts;
