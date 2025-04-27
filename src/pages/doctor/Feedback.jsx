import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Table, Button, message } from 'antd';
import Layout from '../../components/doctor/Layout';

const Feedback = () => {
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchFeedbacks = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        const response = await axios.get('http://localhost:5000/api/doctors/feedback', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        setFeedbacks(response.data.data);
      } catch (error) {
        console.error('Failed to fetch feedbacks:', error);
        message.error('Failed to load feedbacks.');
      } finally {
        setLoading(false);
      }
    };

    fetchFeedbacks();
  }, []);

  const updateFeedbackStatus = async (feedbackId, status) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `http://localhost:5000/api/doctors/feedback/${feedbackId}/status`,
        { status },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      message.success(`Feedback marked as ${status}`);
      setFeedbacks((prevFeedbacks) =>
        prevFeedbacks.map((feedback) =>
          feedback._id === feedbackId ? { ...feedback, status } : feedback
        )
      );
    } catch (error) {
      console.error('Failed to update feedback status:', error);
      message.error('Failed to update feedback status.');
    }
  };

  const columns = [
    {
      title: 'Patient Name',
      dataIndex: 'patientName',
      key: 'patientName',
      render: (_, record) => `${record.patientId.firstName} ${record.patientId.lastName}`
    },
    {
      title: 'Feedback',
      dataIndex: 'comments',
      key: 'comments'
    },
    {
      title: 'Rating',
      dataIndex: 'rating',
      key: 'rating',
      render: (rating) => <span className="text font-semibold">{rating || 'N/A'}</span>
    },
    {
      title: 'Appointment Date',
      dataIndex: 'appointmentDate',
      key: 'appointmentDate',
      render: (_, record) => new Date(record.appointmentId.date).toLocaleDateString()
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <span
          className={`px-2 py-1 rounded ${
            status === 'reviewed' ? 'bg-green-200 text-green-800' : 'bg-yellow-200 text-yellow-800'
          }`}
        >
          {status}
        </span>
      )
    },
    {
        title: 'Actions',
        key: 'actions',
        render: (_, record) => (
          <div className="flex gap-2">
            <Button
              type="primary"
              size="small"
              onClick={() => updateFeedbackStatus(record._id, 'reviewed')}
            >
              Reviewed
            </Button>
            <Button
              type="primary"
              danger
              size="small"
              onClick={() => updateFeedbackStatus(record._id, 'pending')}
            >
              Pending
            </Button>
          </div>
        )
      }
      
  ];

  return (
    <Layout>
      <div className="p-6 bg-[#B9E5E8] rounded-xl">
        <h1 className="text-3xl font-bold mb-6">Feedback</h1>
        <Table
          dataSource={feedbacks}
          columns={columns}
          rowKey="_id"
          loading={loading}
          pagination={{ pageSize: 5 }}
          bordered
          className="ant-table-fixed" // Fix row alignment
        />
      </div>
    </Layout>
  );
};

export default Feedback;
