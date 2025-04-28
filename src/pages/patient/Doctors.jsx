import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Table, Select, Input, Button, message, Modal, Form, DatePicker } from 'antd';
import { Users, Calendar } from 'lucide-react';
import Layout from '../../components/patient/Layout';
import utc from 'dayjs/plugin/utc';
import dayjs from 'dayjs';

dayjs.extend(utc);

const { Option } = Select;
const { Search } = Input;

const Doctors = () => {
  const [doctors, setDoctors] = useState([]);
  const [filteredDoctors, setFilteredDoctors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [genderFilter, setGenderFilter] = useState('');
  const [specialtyFilter, setSpecialtyFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [availableTimes, setAvailableTimes] = useState([]);
  const [form] = Form.useForm();

  const specialtyOptions = [
    { value: 'Cardiology', label: 'Cardiology' },
    { value: 'Neurology', label: 'Neurology' },
    { value: 'Pediatrics', label: 'Pediatrics' },
    { value: 'Orthopedics', label: 'Orthopedics' },
    { value: 'Dermatology', label: 'Dermatology' },
    { value: 'Oncology', label: 'Oncology' },
    { value: 'Gynecology', label: 'Gynecology' },
    { value: 'Psychiatry', label: 'Psychiatry' },
    { value: 'General Surgery', label: 'General Surgery' },
    { value: 'Endocrinology', label: 'Endocrinology' }
  ];

  const placeholderImage = 'https://placehold.co/40?text=Doc';

  const fetchDoctors = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/patients/doctors', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      console.log('Doctors response:', response.data);
      if (response.data.success) {
        const doctorsData = response.data.data;
        setDoctors(doctorsData);
        setFilteredDoctors(doctorsData);
      } else {
        message.error(response.data.message || 'Failed to load doctors');
      }
    } catch (error) {
      console.error('Failed to fetch doctors:', error.response?.data || error);
      message.error(error.response?.data?.message || 'Failed to load doctors');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctors();
  }, []);

  useEffect(() => {
    // Apply filters and search
    let result = doctors;
    
    // Gender filter
    if (genderFilter) {
      result = result.filter((doc) => 
        doc.gender && doc.gender.toLowerCase() === genderFilter.toLowerCase()
      );
    }
    
    // Specialty filter
    if (specialtyFilter) {
      result = result.filter((doc) => 
        doc.profile && doc.profile.specialty && 
        doc.profile.specialty.toLowerCase() === specialtyFilter.toLowerCase()
      );
    }
    
    // Search by name
    if (searchTerm) {
      const lowerSearch = searchTerm.toLowerCase();
      result = result.filter(
        (doc) =>
          (doc.firstName && doc.firstName.toLowerCase().includes(lowerSearch)) ||
          (doc.lastName && doc.lastName.toLowerCase().includes(lowerSearch))
      );
    }
    
    console.log('Filtered doctors:', result);
    setFilteredDoctors(result);
  }, [genderFilter, specialtyFilter, searchTerm, doctors]);

  const handleResetFilters = () => {
    setGenderFilter('');
    setSpecialtyFilter('');
    setSearchTerm('');
    setFilteredDoctors(doctors);
  };

  const showBookingModal = (doctor) => {
    console.log('Selected Doctor:', doctor);
    setSelectedDoctor(doctor);
    setIsModalVisible(true);
    form.resetFields();
    setAvailableTimes([]);
  };

  const handleModalCancel = () => {
    setIsModalVisible(false);
    setSelectedDoctor(null);
    setAvailableTimes([]);
    form.resetFields();
  };

  const handleDateChange = (date) => {
    console.log('Raw Selected Date:', date);

    if (!date || !dayjs.isDayjs(date)) {
      console.log('Invalid or null date, resetting available times');
      setAvailableTimes([]);
      return;
    }

    // Format selected date in UTC
    const formattedDate = dayjs.utc(date).format('YYYY-MM-DD');
    console.log('Formatted Selected Date:', formattedDate);

    const availableTimes = selectedDoctor?.profile?.availability?.filter((avail) => {
      // Parse and format availability date in UTC
      const availDate = dayjs.utc(avail.date).format('YYYY-MM-DD');
      console.log('Checking avail date:', availDate, '===', formattedDate);
      return availDate === formattedDate && avail.available;
    }) || [];

    console.log('Available Times:', availableTimes);
    setAvailableTimes(availableTimes);
  };

  // Disable dates not in doctor's availability
  const disabledDate = (current) => {
    if (!selectedDoctor?.profile?.availability) return true;

    // Get unique available dates in UTC
    const availableDates = [
      ...new Set(
        selectedDoctor.profile.availability
          .filter((avail) => avail.available)
          .map((avail) => dayjs.utc(avail.date).format('YYYY-MM-DD'))
      )
    ];

    // Disable if current date is not in availableDates
    return !availableDates.includes(dayjs.utc(current).format('YYYY-MM-DD'));
  };

  const handleBookAppointment = async (values) => {
    try {
      const token = localStorage.getItem('token');
      const payload = {
        doctorId: selectedDoctor._id,
        date: dayjs(values.date).utc().format('YYYY-MM-DD'),
        time: values.time,
        notes: values.notes || ''
      };
      const response = await axios.post(
        'http://localhost:5000/api/patients/appointments',
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      console.log('Book appointment response:', response.data);
      if (response.data.success) {
        message.success(response.data.message);
        handleModalCancel();
      } else {
        message.error(response.data.message || 'Failed to book appointment');
      }
    } catch (error) {
      console.error('Book appointment error:', error.response?.data || error);
      message.error(error.response?.data?.message || 'Failed to book appointment');
    }
  };

  const columns = [
    {
      title: 'Image',
      dataIndex: 'profileImage',
      key: 'profileImage',
      render: (profileImage) => (
        <img
          src={profileImage || placeholderImage}
          alt="Doctor"
          className="doctor-profile-image"
          onError={(e) => (e.target.src = placeholderImage)}
        />
      ),
      width: 80
    },
    {
      title: 'Name',
      key: 'name',
      render: (_, record) => `${record.firstName} ${record.lastName}`
    },
    {
      title: 'Gender',
      dataIndex: 'gender',
      key: 'gender',
      render: (gender) => gender ? gender.charAt(0).toUpperCase() + gender.slice(1) : 'N/A'
    },
    {
      title: 'Specialty',
      dataIndex: ['profile', 'specialty'],
      key: 'specialty',
      render: (specialty) => specialty || 'N/A'
    },
    {
      title: 'Action',
      key: 'action',
      render: (_, record) => (
        <Button
          className="book-appointment-button"
          onClick={() => showBookingModal(record)}
        >
          Book Appointment
        </Button>
      ),
      width: 150
    }
  ];

  return (
    <Layout role="patient">
      <div className="mb-12">
        <h1 className="text-4xl pt-2.5 font-bold flex items-center">
          <Users size={32} className="mr-2 text-[#4A628A]" />
          Doctors
        </h1>
        <p className="text-gray-600 text-lg">View and filter available doctors</p>
      </div>

      <div className="bg-[#B9E5E8] rounded-xl p-6">
        <div className="flex gap-4 mb-6 flex-wrap">
          <Select
            placeholder="Filter by Gender"
            value={genderFilter || undefined}
            onChange={(value) => setGenderFilter(value)}
            className="w-48"
            allowClear
          >
            <Option value="male">Male</Option>
            <Option value="female">Female</Option>
            <Option value="other">Other</Option>
          </Select>
          <Select
            placeholder="Filter by Specialty"
            value={specialtyFilter || undefined}
            onChange={(value) => setSpecialtyFilter(value)}
            className="w-48"
            allowClear
          >
            {specialtyOptions.map((option) => (
              <Option key={option.value} value={option.value}>{option.label}</Option>
            ))}
          </Select>
          <Search
            placeholder="Search by name"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-48"
            allowClear
          />
          <Button
            onClick={handleResetFilters}
            className="bg-[#4A628A] text-white border-none"
          >
            Reset Filters
          </Button>
        </div>

        <Table
          columns={columns}
          dataSource={filteredDoctors}
          rowKey="_id"
          loading={loading}
          pagination={{ pageSize: 10 }}
          className="bg-white rounded-lg"
        />
      </div>

      <Modal
        title={
          <div className="flex items-center">
            <Calendar size={24} className="mr-2 text-[#091840]" />
            Book Appointment with {selectedDoctor?.firstName} {selectedDoctor?.lastName}
          </div>
        }
        visible={isModalVisible}
        onCancel={handleModalCancel}
        footer={null}
        className="booking-modal"
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleBookAppointment}
        >
          <Form.Item
            label="Date"
            name="date"
            rules={[{ required: true, message: 'Please select a date' }]}
          >
            <DatePicker
              onChange={handleDateChange}
              format="YYYY-MM-DD"
              disabledDate={disabledDate}
            />
          </Form.Item>
          <Form.Item
            label="Time"
            name="time"
            rules={[{ required: true, message: 'Please select a time' }]}
          >
            <Select
              placeholder="Select a time"
              options={availableTimes.map((avail) => ({
                value: avail.time,
                label: avail.time,
              }))}
            />
          </Form.Item>
          <Form.Item
            label="Notes (Optional)"
            name="notes"
          >
            <Input.TextArea rows={4} />
          </Form.Item>
          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              className="bg-[#4A628A] border-none"
            >
              Book Appointment
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </Layout>
  );
};

export default Doctors;