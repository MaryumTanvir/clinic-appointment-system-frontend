import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Table, Button, message, Modal, Form, Rate, Input } from 'antd';
import { MessageSquare } from 'lucide-react';
import Layout from '../../components/patient/Layout';
import moment from 'moment';

const Feedback = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isFeedbackModalVisible, setIsFeedbackModalVisible] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [form] = Form.useForm();

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/patients/appointments', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      console.log('Appointments response:', response.data);
      if (response.data.success) {
        const appointmentsData = response.data.data;
        setAppointments(appointmentsData);
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

  useEffect(() => {
    fetchAppointments();
  }, []);

  const showFeedbackModal = (appointment) => {
    setSelectedAppointment(appointment);
    setIsFeedbackModalVisible(true);
    form.resetFields();
  };

  const handleFeedbackModalCancel = () => {
    setIsFeedbackModalVisible(false);
    setSelectedAppointment(null);
    form.resetFields();
  };

  const handleSubmitFeedback = async (values) => {
    try {
      const token = localStorage.getItem('token');
      const payload = {
        appointmentId: selectedAppointment._id,
        rating: values.rating,
        comments: values.comments || ''
      };
      const response = await axios.post(
        'http://localhost:5000/api/patients/feedback',
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      console.log('Submit feedback response:', response.data);
      if (response.data.success) {
        message.success(response.data.message);
        fetchAppointments(); // Refresh appointments to update hasFeedback
        handleFeedbackModalCancel();
      } else {
        message.error(response.data.message || 'Failed to submit feedback');
      }
    } catch (error) {
      console.error('Submit feedback error:', error.response?.data || error);
      message.error(error.response?.data?.message || 'Failed to submit feedback');
    }
  };

  const columns = [
    {
      title: 'Doctor Name',
      key: 'doctorName',
      render: (_, record) => `${record.doctorId.firstName} ${record.doctorId.lastName}`
    },
    {
      title: 'Appointment Date',
      dataIndex: 'date',
      key: 'date',
      render: (date) => moment(date).format('YYYY-MM-DD')
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
      title: 'Action',
      key: 'action',
      render: (_, record) =>
        record.status === 'completed' && !record.hasFeedback ? (
          <Button
            className="submit-feedback-button"
            onClick={() => showFeedbackModal(record)}
          >
            Submit Feedback
          </Button>
        ) : (
          'N/A'
        ),
      width: 150
    }
  ];

  return (
    <Layout role="patient">
      <div className="mb-12">
        <h1 className="text-4xl pt-2.5 font-bold flex items-center">
          <MessageSquare size={32} className="mr-2 text-[#4A628A]" />
          Feedback
        </h1>
        <p className="text-gray-600 text-lg">Submit feedback for completed appointments</p>
      </div>

      <div className="bg-[#B9E5E8] rounded-xl p-6">
        <Table
          columns={columns}
          dataSource={appointments}
          rowKey="_id"
          loading={loading}
          pagination={{ pageSize: 10 }}
          className="bg-white rounded-lg"
        />
      </div>

      <Modal
        title={
          <div className="flex items-center">
            <MessageSquare size={24} className="mr-2 text-[#091840]" />
            Submit Feedback
          </div>
        }
        open={isFeedbackModalVisible}
        onCancel={handleFeedbackModalCancel}
        footer={null}
        className="feedback-modal"
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmitFeedback}
        >
          <Form.Item
            label="Appointment Details"
          >
            <p>
              Doctor: {selectedAppointment?.doctorId.firstName} {selectedAppointment?.doctorId.lastName}<br />
              Date: {selectedAppointment && moment(selectedAppointment.date).format('YYYY-MM-DD')}<br />
              Time: {selectedAppointment?.time}
            </p>
          </Form.Item>
          <Form.Item
            label="Rating"
            name="rating"
            rules={[{ required: true, message: 'Please provide a rating' }]}
          >
            <Rate allowHalf />
          </Form.Item>
          <Form.Item
            label="Comments (Optional)"
            name="comments"
          >
            <Input.TextArea rows={4} />
          </Form.Item>
          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              className="bg-[#4A628A] border-none"
            >
              Submit Feedback
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </Layout>
  );
};

export default Feedback;