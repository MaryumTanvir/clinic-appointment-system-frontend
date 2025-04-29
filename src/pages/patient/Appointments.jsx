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
  const [filter, setFilter] = useState('');
  const [rescheduleModalVisible, setRescheduleModalVisible] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [availableTimes, setAvailableTimes] = useState([]);
  const [availableDates, setAvailableDates] = useState([]);
  const [form] = Form.useForm();

  const fetchAppointments = async (timeFilter = '') => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/patients/appointments', {
        headers: { Authorization: `Bearer ${token}` },
        params: { time: timeFilter },
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
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log('Doctor profile response:', response.data);
      if (response.data.success) {
        const availability = response.data.data.profile?.availability || [];
        console.log('Availability:', availability);
        const dates = [
          ...new Set(
            availability
              .filter((slot) => slot.available)
              .map((slot) => dayjs(slot.date).format('YYYY-MM-DD')) // Local time for display
          ),
        ];
        setAvailableDates(dates);
        console.log('Available dates:', dates);
        if (selectedDate && dayjs.isDayjs(selectedDate)) {
          const selectedDateStr = dayjs(selectedDate).format('YYYY-MM-DD'); // Local time
          const times = availability
            .filter((slot) => {
              const slotDate = dayjs(slot.date).format('YYYY-MM-DD'); // Local time
              return slotDate === selectedDateStr && slot.available;
            })
            .map((slot) => slot.time);
          setAvailableTimes(times);
          console.log('Available times:', times);
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
        fetchAppointments(filter);
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
      console.log('Reschedule form values:', values);
      const token = localStorage.getItem('token');
      const incrementedDate = dayjs(values.date).add(1, 'day'); // Add one day

      const payload = {
        date: incrementedDate.utc().format('YYYY-MM-DD'), // Send as UTC
        time: values.time,
        notes: values.notes,
      };
      console.log('Reschedule payload:', {
        appointmentId: selectedAppointment._id,
        payload,
        utcDate: payload.date,
        localDate: dayjs(values.date).format('YYYY-MM-DD HH:mm:ss Z'),
      });
      const response = await axios.put(
        `http://localhost:5000/api/patients/appointments/${selectedAppointment._id}/reschedule`,
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      console.log('Reschedule response:', {
        status: response.status,
        data: response.data,
      });
      if (response.data.success) {
        message.success(response.data.message);
        setRescheduleModalVisible(false);
        form.resetFields();
        fetchAppointments(filter);
      } else {
        console.error('Reschedule failed:', response.data);
        message.error(response.data.message || 'Failed to reschedule appointment');
      }
    } catch (error) {
      console.error('Reschedule appointment error:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        request: {
          url: error.config?.url,
          data: error.config?.data,
        },
      });
      message.error(error.response?.data?.message || 'Failed to reschedule appointment');
    }
  };

  const openRescheduleModal = (appointment) => {
    setSelectedAppointment(appointment);
    setRescheduleModalVisible(true);
    setAvailableTimes([]);
    setAvailableDates([]);
    form.setFieldsValue({
      date: null,
      time: null,
      notes: appointment.notes || '',
    });
    fetchDoctorAvailability(appointment.doctorId._id, null);
  };

  const handleDateChange = (date) => {
    if (date && selectedAppointment) {
      fetchDoctorAvailability(selectedAppointment.doctorId._id, date);
    } else {
      setAvailableTimes([]);
    }
  };

  const disabledDate = (current) => {
    if (!current || availableDates.length === 0) return true;
    const today = dayjs().startOf('day'); // Local time
    if (current < today) return true;
    const currentDateStr = dayjs(current).format('YYYY-MM-DD'); // Local time
    return !availableDates.includes(currentDateStr);
  };

  const isCancelEligible = (appointment) => {
    const today = dayjs().startOf('day').toDate(); // Local time
    return (
      ['scheduled', 'rescheduled'].includes(appointment.status) &&
      dayjs(appointment.date).startOf('day').toDate() >= today
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
      render: (doctor) => `${doctor.firstName} ${doctor.lastName}`,
    },
    {
      title: 'Date',
      dataIndex: 'date',
      key: 'date',
      render: (date) => dayjs(date).format('YYYY-MM-DD'), // Local time
    },
    {
      title: 'Time',
      dataIndex: 'time',
      key: 'time',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => status.charAt(0).toUpperCase() + status.slice(1),
    },
    {
      title: 'Notes',
      dataIndex: 'notes',
      key: 'notes',
      render: (notes) => notes || 'No notes',
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <div className="flex gap-2" data-testid={`appointment-row-${record._id}`}>
          <Button
            type="primary"
            danger
            onClick={() => handleCancelAppointment(record._id)}
            disabled={!isCancelEligible(record)}
            className="bg-red-600 disabled:bg-gray-300"
            data-testid="cancel-button"
          >
            Cancel
          </Button>
          <Button
            type="primary"
            onClick={() => openRescheduleModal(record)}
            disabled={!isRescheduleEligible(record)}
            className="bg-[#4A628A] disabled:bg-gray-300"
            data-testid="reschedule-button"
          >
            Reschedule
          </Button>
        </div>
      ),
    },
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
            data-testid="filter-all-button"
          >
            All
          </Button>
          <Button
            type={filter === 'past' ? 'primary' : 'default'}
            onClick={() => setFilter('past')}
            className={filter === 'past' ? 'bg-[#4A628A] text-white border-none' : ''}
            data-testid="filter-past-button"
          >
            Past
          </Button>
          <Button
            type={filter === 'today' ? 'primary' : 'default'}
            onClick={() => setFilter('today')}
            className={filter === 'today' ? 'bg-[#4A628A] text-white border-none' : ''}
            data-testid="filter-today-button"
          >
            Today
          </Button>
          <Button
            type={filter === 'future' ? 'primary' : 'default'}
            onClick={() => setFilter('future')}
            className={filter === 'future' ? 'bg-[#4A628A] text-white border-none' : ''}
            data-testid="filter-future-button"
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
          data-testid="appointments-table"
        />

        <Modal
          title="Reschedule Appointment"
          open={rescheduleModalVisible}
          onCancel={() => {
            setRescheduleModalVisible(false);
            form.resetFields();
            setAvailableTimes([]);
            setAvailableDates([]);
          }}
          footer={null}
          className="reschedule-modal"
          data-testid="reschedule-modal"
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
                data-testid="date-picker"
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
                data-testid="time-select"
              >
                {availableTimes.map((time) => (
                  <Option key={time} value={time} data-testid={`time-option-${time}`}>
                    {time}
                  </Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item
              name="notes"
              label="Notes (Optional)"
            >
              <textarea
                className="w-full p-2 border border-[#091840] rounded"
                rows={4}
                data-testid="notes-textarea"
              />
            </Form.Item>
            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                className="bg-[#4A628A] w-full"
                data-testid="submit-reschedule-button"
              >
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