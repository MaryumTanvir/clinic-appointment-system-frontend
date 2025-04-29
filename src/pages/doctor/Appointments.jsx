import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Table, Button, message, Modal, Input } from 'antd';
import { ClipboardList } from 'lucide-react';
import Layout from '../../components/doctor/Layout';

const Appointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState('future');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedAppointmentId, setSelectedAppointmentId] = useState(null);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        const response = await axios.get(
          `${import.meta.env.VITE_API_URL}/doctors/appointments?filter=${filter}`,
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );
        setAppointments(response.data.data);
      } catch (error) {
        console.error('Failed to fetch appointments:', error);
        message.error('Failed to load appointments.');
      } finally {
        setLoading(false);
      }
    };

    fetchAppointments();
  }, [filter]);

  const handleUpdateStatus = async (appointmentId, status, updatedNotes = null) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const payload = { status };
      if (updatedNotes) {
        payload.notes = updatedNotes;
      }
      const response = await axios.put(
        `${import.meta.env.VITE_API_URL}/doctors/appointments/${appointmentId}/status`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      setAppointments((prev) =>
        prev.map((appt) =>
          appt._id === appointmentId
            ? { ...appt, status, notes: updatedNotes || appt.notes, updatedAt: new Date() }
            : appt
        )
      );
      message.success(`Appointment marked as ${status}`);
    } catch (error) {
      console.error('Failed to update appointment status:', error);
      message.error(error.response?.data?.message || 'Failed to update appointment status.');
    } finally {
      setLoading(false);
    }
  };

  const showNotesModal = (appointmentId, currentNotes) => {
    setSelectedAppointmentId(appointmentId);
    setNotes(currentNotes || '');
    setIsModalVisible(true);
  };

  const handleModalOk = () => {
    handleUpdateStatus(selectedAppointmentId, 'completed', notes);
    setIsModalVisible(false);
    setSelectedAppointmentId(null);
    setNotes('');
  };

  const handleModalCancel = () => {
    setIsModalVisible(false);
    setSelectedAppointmentId(null);
    setNotes('');
  };

  const calculateAppointmentStatus = (appointment) => {
    const now = new Date();
    const apptDateTime = new Date(appointment.date);
    const [hour, minute] = appointment.time.split(':').map(Number);
    apptDateTime.setHours(hour, minute, 0, 0);

    if (appointment.status === 'completed') return 'Completed';
    if (appointment.status === 'cancelled') return 'Cancelled';
    if (now < apptDateTime) {
      const timeLeft = apptDateTime - now;
      const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
      const hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
      return `${days > 0 ? `${days}d ` : ''}${hours > 0 ? `${hours}h ` : ''}${minutes}m left`;
    }
    return 'Scheduled';
  };

  const columns = [
    {
      title: 'Patient Name',
      key: 'patientName',
      render: (_, record) =>
        `${record.patientId?.firstName || 'N/A'} ${record.patientId?.lastName || ''}`
    },
    {
      title: 'Email',
      key: 'email',
      render: (_, record) => record.patientId?.email || 'N/A'
    },
    {
      title: 'Phone',
      key: 'phone',
      render: (_, record) => record.contact?.phone || 'N/A'
    },
    {
      title: 'Date',
      dataIndex: 'date',
      key: 'date',
      render: (date) => new Date(date).toLocaleDateString()
    },
    {
      title: 'Time',
      dataIndex: 'time',
      key: 'time'
    },
    {
      title: 'Status',
      key: 'status',
      render: (_, record) => {
        const status = calculateAppointmentStatus(record);
        return (
          <span
            className={`px-2 py-1 rounded ${
              status === 'Completed'
                ? 'bg-green-200 text-green-800'
                : status === 'Cancelled'
                ? 'bg-red-200 text-red-800'
                : status === 'Scheduled'
                ? 'bg-blue-200 text-blue-800'
                : 'bg-yellow-200 text-yellow-800'
            }`}
          >
            {status}
          </span>
        );
      }
    },
    {
      title: 'Notes',
      dataIndex: 'notes',
      key: 'notes',
      render: (notes) => <span className="text-gray-700">{notes || 'N/A'}</span>
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => {
        if (record.status === 'completed' || record.status === 'cancelled') {
          return <span className="text-gray-500">No actions available</span>;
        }
        return (
          <div className="flex gap-2">
            <Button
              type="primary"
              size="small"
              onClick={() => showNotesModal(record._id, record.notes)}
              disabled={loading}
            >
              Complete
            </Button>
            <Button
              type="default"
              size="small"
              onClick={() => handleUpdateStatus(record._id, 'cancelled')}
              disabled={loading}
            >
              Cancel
            </Button>
          </div>
        );
      }
    }
  ];

  return (
    <Layout>
      <div className="p-6 bg-[#B9E5E8] rounded-xl">
        <div className="flex items-center mb-6">
          <div className="flex items-center justify-center w-14 h-14 bg-white rounded-lg shadow-md">
            <ClipboardList size={28} className="text-[#4A628A]" />
          </div>
          <h1 className="text-3xl font-bold text-[#4A628A] ml-4 leading-tight">
            Appointments
          </h1>
        </div>

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

        <Table
          dataSource={appointments}
          columns={columns}
          rowKey="_id"
          loading={loading}
          pagination={{ pageSize: 5 }}
          bordered
          className="ant-table-fixed"
        />

        <Modal
          title="Update Appointment Notes"
          visible={isModalVisible}
          onOk={handleModalOk}
          onCancel={handleModalCancel}
          okText="Save and Complete"
          cancelText="Cancel"
        >
          <Input.TextArea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Enter or update appointment notes"
            rows={4}
          />
        </Modal>
      </div>
    </Layout>
  );
};

export default Appointments;