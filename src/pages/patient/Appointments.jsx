import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Table, Button, message, Modal, DatePicker, Select, Form } from 'antd';
import { Calendar } from 'lucide-react';
import Layout from '../../components/patient/Layout';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';

dayjs.extend(utc);

const { Option } = Select;

const Appointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState(''); // '' for all, 'past', 'today', 'future'
  const [rescheduleModalVisible, setRescheduleModalVisible] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [availableTimes, setAvailableTimes] = useState([]);
  const [availableDates, setAvailableDates] = useState([]); // Store doctor's available dates
  const [form] = Form.useForm();

  const fetchAppointments = async (timeFilter = '') => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/patients/appointments', {
        headers: {
          Authorization: `Bearer ${token}`
        },
        params: { time: timeFilter }
      });
      console.log('Appointments response:', response.data);
      if (response.data.success) {
        setAppointments(response.data.data);
      } else {
        message.error(response.data.message || 'Failed to load appointments');
      }
    } catch (error) {
      console.error('Failed to fetch appointments:', error.response?.data || error);
      message.error(error.response?.data?.message || 'Failed to load appointments');
    } finally {
      setLoading(false);
    }
  };

  const fetchDoctorAvailability = async (doctorId, selectedDate) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`http://localhost:5000/api/patients/doctors/${doctorId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      console.log('Doctor profile response:', response.data);
      if (response.data.success) {
        const availability = response.data.data.profile?.availability || [];
        console.log("Availability:", availability);
        // Store unique available dates for DatePicker
        const dates = [
          ...new Set(
            availability
              .filter((slot) => slot.available)
              .map((slot) => dayjs.utc(slot.date).format('YYYY-MM-DD'))
          )
        ];
        setAvailableDates(dates);
        console.log("Available dates:", dates);
        // Filter available times for the selected date
        if (selectedDate && dayjs.isDayjs(selectedDate)) {
          const selectedDateStr = dayjs.utc(selectedDate).format('YYYY-MM-DD');
          const times = availability
            .filter((slot) => {
              const slotDate = dayjs.utc(slot.date).format('YYYY-MM-DD');
              return slotDate === selectedDateStr && slot.available;
            })
            .map((slot) => slot.time);
          setAvailableTimes(times);
          console.log("Available times:", times);
        } else {
          setAvailableTimes([]);
        }
      } else {
        message.error(response.data.message || 'Failed to load doctor availability');
        setAvailableTimes([]);
        setAvailableDates([]);
      }
    } catch (error) {
      console.error('Failed to fetch doctor availability:', error.response?.data || error);
      message.error(error.response?.data?.message || 'Failed to load doctor availability');
      setAvailableTimes([]);
      setAvailableDates([]);
    }
  };

  useEffect(() => {
    fetchAppointments(filter);
  }, [filter]);

  const handleCancelAppointment = async (appointmentId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(
        `http://localhost:5000/api/patients/appointments/${appointmentId}/cancel`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      console.log('Cancel response:', response.data);
      if (response.data.success) {
        message.success(response.data.message);
        fetchAppointments(filter); // Refresh appointments
      } else {
        message.error(response.data.message || 'Failed to cancel appointment');
      }
    } catch (error) {
      console.error('Cancel appointment error:', error.response?.data || error);
      message.error(error.response?.data?.message || 'Failed to cancel appointment');
    }
  };

  const handleRescheduleAppointment = async (values) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(
        `http://localhost:5000/api/patients/appointments/${selectedAppointment._id}/reschedule`,
        {
          date: dayjs.utc(values.date).format('YYYY_party-MM-DD'),
          time: values.time,
          notes: values.notes
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      console.log('Reschedule response:', response.data);
      if (response.data.success) {
        message.success(response.data.message);
        setRescheduleModalVisible(false);
        form.resetFields();
        fetchAppointments(filter); // Refresh appointments
      } else {
        message.error(response.data.message || 'Failed to reschedule appointment');
      }
    } catch (error) {
      console.error('Reschedule appointment error:', error.response?.data || error);
      message.error(error.response?.data?.message || 'Failed to reschedule appointment');
    }
  };

  const openRescheduleModal = (appointment) => {
    setSelectedAppointment(appointment);
    setRescheduleModalVisible(true);
    setAvailableTimes([]); // Reset times
    setAvailableDates([]); // Reset dates
    form.setFieldsValue({
      date: null,
      time: null,
      notes: appointment.notes || ''
    });
    // Fetch doctor's availability when modal opens
    fetchDoctorAvailability(appointment.doctorId._id, null);
  };

  const handleDateChange = (date) => {
    if (date && selectedAppointment) {
      fetchDoctorAvailability(selectedAppointment.doctorId._id, date);
    } else {
      setAvailableTimes([]);
    }
  };

  // Disable dates not in doctor's availability
  const disabledDate = (current) => {
    if (!current || availableDates.length === 0) return true;

    // Disable past dates
    const today = dayjs.utc().startOf('day');
    if (current < today) return true;

    // Disable dates not in availableDates
    const currentDateStr = dayjs.utc(current).format('YYYY-MM-DD');
    return !availableDates.includes(currentDateStr);
  };

  const isCancelEligible = (appointment) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return (
      ['scheduled', 'rescheduled'].includes(appointment.status) &&
      new Date(appointment.date) >= today
    );
  };

  const isRescheduleEligible = (appointment) => {
    return ['scheduled', 'rescheduled'].includes(appointment.status);
  };

  const columns = [
    {
      title: 'Doctor',
      dataIndex: 'doctorId',
      key: 'doctor',
      render: (doctor) => `${doctor.firstName} ${doctor.lastName}`
    },
    {
      title: 'Date',
      dataIndex: 'date',
      key: 'date',
      render: (date) => new Date(date).toISOString().split('T')[0]
    },
    {
      title: 'Time',
      dataIndex: 'time',
      key: 'time'
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => status.charAt(0).toUpperCase() + status.slice(1)
    },
    {
      title: 'Notes',
      dataIndex: 'notes',
      key: 'notes',
      render: (notes) => notes || 'No notes'
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <div className="flex gap-2">
          <Button
            type="primary"
            danger
            onClick={() => handleCancelAppointment(record._id)}
            disabled={!isCancelEligible(record)}
            className="bg-red-600 disabled:bg-gray-300"
          >
            Cancel
          </Button>
          <Button
            type="primary"
            onClick={() => openRescheduleModal(record)}
            disabled={!isRescheduleEligible(record)}
            className="bg-[#4A628A] disabled:bg-gray-300"
          >
            Reschedule
          </Button>
        </div>
      )
    }
  ];

  return (
    <Layout role="patient">
      <div className="mb-12">
        <h1 className="text-4xl pt-2.5 font-bold flex items-center">
          <Calendar size={32} className="mr-2 text-[#4A628A]" />
          My Appointments
        </h1>
        <p className="text-gray-600 text-lg">View and filter your appointments</p>
      </div>

      <div className="bg-[#B9E5E8] rounded-xl p-6">
        <div className="flex gap-4 mb-6">
          <Button
            type={filter === '' ? 'primary' : 'default'}
            onClick={() => setFilter('')}
            className={filter === '' ? 'bg-[#4A628A] text-white border-none' : ''}
          >
            All
          </Button>
          <Button
            type={filter === 'past' ? 'primary' : 'default'}
            onClick={() => setFilter('past')}
            className={filter === 'past' ? 'bg-[#4A628A] text-white border-none' : ''}
          >
            Past
          </Button>
          <Button
            type={filter === 'today' ? 'primary' : 'default'}
            onClick={() => setFilter('today')}
            className={filter === 'today' ? 'bg-[#4A628A] text-white border-none' : ''}
          >
            Today
          </Button>
          <Button
            type={filter === 'future' ? 'primary' : 'default'}
            onClick={() => setFilter('future')}
            className={filter === 'future' ? 'bg-[#4A628A] text-white border-none' : ''}
          >
            Future
          </Button>
        </div>

        <Table
          columns={columns}
          dataSource={appointments}
          rowKey="_id"
          loading={loading}
          pagination={{ pageSize: 10 }}
          className="bg-white rounded-lg"
        />

        <Modal
          title="Reschedule Appointment"
          visible={rescheduleModalVisible}
          onCancel={() => {
            setRescheduleModalVisible(false);
            form.resetFields();
            setAvailableTimes([]);
            setAvailableDates([]);
          }}
          footer={null}
          className="reschedule-modal"
        >
          <Form
            form={form}
            onFinish={handleRescheduleAppointment}
            layout="vertical"
            className="p-4"
          >
            <Form.Item
              name="date"
              label="Date"
              rules={[{ required: true, message: 'Please select a date' }]}
            >
              <DatePicker
                format="YYYY-MM-DD"
                disabledDate={disabledDate}
                onChange={handleDateChange}
                className="w-full"
              />
            </Form.Item>
            <Form.Item
              name="time"
              label="Time"
              rules={[{ required: true, message: 'Please select a time' }]}
            >
              <Select
                placeholder="Select time"
                className="w-full"
                disabled={availableTimes.length === 0}
                notFoundContent={availableTimes.length === 0 ? 'No available times for selected date' : null}
              >
                {availableTimes.map((time) => (
                  <Option key={time} value={time}>{time}</Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item
              name="notes"
              label="Notes (Optional)"
            >
              <textarea className="w-full p-2 border border-[#091840] rounded" rows={4} />
            </Form.Item>
            <Form.Item>
              <Button type="primary" htmlType="submit" className="bg-[#4A628A] w-full">
                Reschedule
              </Button>
            </Form.Item>
          </Form>
        </Modal>
      </div>
    </Layout>
  );
};

export default Appointments;