import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Table, Select, Button, message, Modal, Form } from 'antd';
import { DollarSign } from 'lucide-react';
import Layout from '../../components/patient/Layout';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';

dayjs.extend(utc);

const { Option } = Select;

const Payments = () => {
  const [payments, setPayments] = useState([]);
  const [filteredPayments, setFilteredPayments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState('');
  const [isPaymentModalVisible, setIsPaymentModalVisible] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [form] = Form.useForm();

  const paymentMethodOptions = [
    { value: 'Credit Card', label: 'Credit Card' },
    { value: 'Bank Transfer', label: 'Bank Transfer' }
  ];

  const fetchPayments = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/patients/payments', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      console.log('Payments response:', response.data);
      if (response.data.success) {
        const paymentsData = response.data.data;
        setPayments(paymentsData);
        setFilteredPayments(paymentsData);
      } else {
        message.error(response.data.message || 'Failed to load payments');
      }
    } catch (error) {
      console.error('Failed to fetch payments:', error.response?.data || error);
      message.error(error.response?.data?.message || 'Failed to load payments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  useEffect(() => {
    // Apply status filter
    let result = payments;
    if (statusFilter) {
      result = payments.filter((payment) => payment.status.toLowerCase() === statusFilter.toLowerCase());
    }
    console.log('Filtered payments:', result);
    setFilteredPayments(result);
  }, [statusFilter, payments]);

  const handleResetFilters = () => {
    setStatusFilter('');
    setFilteredPayments(payments);
  };

  const showPaymentModal = (payment) => {
    setSelectedPayment(payment);
    setIsPaymentModalVisible(true);
    form.resetFields();
  };

  const handlePaymentModalCancel = () => {
    setIsPaymentModalVisible(false);
    setSelectedPayment(null);
    form.resetFields();
  };

  const handleMakePayment = async (values) => {
    try {
      if (selectedPayment.appointmentId.status !== 'completed') {
        message.error('Payment can only be made for completed appointments');
        return;
      }

      const token = localStorage.getItem('token');
      const payload = {
        appointmentIds: [selectedPayment.appointmentId._id],
        method: values.method
      };
      const response = await axios.post(
        'http://localhost:5000/api/patients/payments',
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      console.log('Make payment response:', response.data);
      if (response.data.success) {
        message.success(response.data.message);
        fetchPayments(); // Refresh payments
        handlePaymentModalCancel();
      } else {
        message.error(response.data.message || 'Failed to process payment');
      }
    } catch (error) {
      console.error('Make payment error:', error.response?.data || error);
      message.error(error.response?.data?.message || 'Failed to process payment');
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
      dataIndex: ['appointmentId', 'date'],
      key: 'date',
      render: (date) => dayjs.utc(date).format('YYYY-MM-DD')
    },
    {
      title: 'Time',
      dataIndex: ['appointmentId', 'time'],
      key: 'time'
    },
    {
      title: 'Amount',
      dataIndex: 'amount',
      key: 'amount',
      render: (amount) => `PKR ${amount}`
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
        record.status === 'pending' && record.appointmentId.status === 'completed' ? (
          <Button
            className="pay-now-button"
            onClick={() => showPaymentModal(record)}
          >
            Pay Now
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
          <DollarSign size={32} className="mr-2 text-[#4A628A]" />
          Payments
        </h1>
        <p className="text-gray-600 text-lg">View and manage your payments</p>
      </div>

      <div className="bg-[#B9E5E8] rounded-xl p-6">
        <div className="flex gap-4 mb-6 flex-wrap">
          <Select
            placeholder="Filter by Status"
            value={statusFilter || undefined}
            onChange={(value) => setStatusFilter(value)}
            className="w-48"
            allowClear
          >
            <Option value="paid">Paid</Option>
            <Option value="pending">Unpaid</Option>
          </Select>
          <Button
            onClick={handleResetFilters}
            className="bg-[#4A628A] text-white border-none"
          >
            Reset Filter
          </Button>
        </div>

        <Table
          columns={columns}
          dataSource={filteredPayments}
          rowKey="_id"
          loading={loading}
          pagination={{ pageSize: 10 }}
          className="bg-white rounded-lg"
        />
      </div>

      <Modal
        title={
          <div className="flex items-center">
            <DollarSign size={24} className="mr-2 text-[#091840]" />
            Pay for Appointment
          </div>
        }
        open={isPaymentModalVisible}
        onCancel={handlePaymentModalCancel}
        footer={null}
        className="payment-modal"
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleMakePayment}
        >
          <Form.Item
            label="Appointment Details"
          >
            <p>
              Doctor: {selectedPayment?.doctorId.firstName} {selectedPayment?.doctorId.lastName}<br />
              Date: {selectedPayment && dayjs.utc(selectedPayment.appointmentId.date).format('YYYY-MM-DD')}<br />
              Time: {selectedPayment?.appointmentId.time}<br />
              Amount: PKR {selectedPayment?.amount}
            </p>
          </Form.Item>
          <Form.Item
            label="Payment Method"
            name="method"
            rules={[{ required: true, message: 'Please select a payment method' }]}
          >
            <Select
              placeholder="Select a payment method"
              className="w-full"
            >
              {paymentMethodOptions.map((option) => (
                <Option key={option.value} value={option.value}>{option.label}</Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              className="bg-[#4A628A] border-none"
            >
              Pay Now
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </Layout>
  );
};

export default Payments;