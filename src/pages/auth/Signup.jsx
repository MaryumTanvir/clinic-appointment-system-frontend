import { useState } from 'react';
import { Form, Input, Button, message, Select } from 'antd';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import axios from 'axios';
import logo from '../../assets/logo.png';

function Signup() {
  const [loading, setLoading] = useState(false);
  const [role, setRole] = useState(null);
  const { login } = useAuth();
  const navigate = useNavigate();

  const onFinish = async (values) => {
    setLoading(true);
    try {
      const profile = {};
      if (role === 'patient') {
        if (values.age) profile.age = Number(values.age);
        profile.contact = values.phone ? { phone: values.phone } : {};
        profile.medicalHistory = values.medicalHistory ? values.medicalHistory.split(',').map(item => item.trim()) : [];
      } else if (role === 'doctor') {
        profile.specialty = values.specialty;
        profile.credentials = values.credentials;
        profile.contact = values.phone ? { phone: values.phone } : {};
      } else if (role === 'admin') {
        profile.department = values.department;
        profile.designation = values.designation;
        profile.contact = values.phone ? { phone: values.phone } : {};
      }

      const payload = {
        firstName: values.firstName,
        lastName: values.lastName,
        gender: values.gender,
        email: values.email,
        password: values.password,
        role: values.role,
        profile,
      };
      console.log('Sending payload:', payload);

      const response = await axios.post(`${import.meta.env.VITE_API_URL}/auth/signup`, payload);
      console.log('Signup response:', response.data);

      if (response.data.success) {
        if (role === 'doctor') {
          message.success(response.data.message || 'Doctor signup request submitted. Awaiting admin approval.');
          navigate('/login', { replace: true });
        } else {
          if (response.data.user && response.data.token) {
            login(response.data.user, response.data.token);
            message.success('Registration successful!');
            if (response.data.user.role === 'patient') {
              navigate('/patient/appointments', { replace: true });
            } else {
              navigate('/', { replace: true });
            }
          } else {
            message.error('Invalid response from server');
          }
        }
      } else {
        message.error(response.data.message || 'Registration failed.');
      }
    } catch (err) {
      console.error('Signup error:', err.response?.data || err);
      message.error(err.response?.data?.message || 'Registration failed. Try again.');
    } finally {
      setLoading(false);
    }
  };

  const preventNegativeInput = (e) => {
    if (e.key === '-' || e.key === 'e') {
      e.preventDefault();
    }
  };

  return (
    <div className="form-container">
      <div className="register-form">
        <div className="flex justify-center mb-6">
          <img src={logo} alt="Clinic Appointment System" className="logo" />
        </div>
        <h3 className="text-2xl font-bold text-accent text-center mb-6">Sign Up</h3>
        <Form
          layout="vertical"
          onFinish={onFinish}
          className="form-grid"
          onValuesChange={(changedValues) => {
            if (changedValues.role) {
              setRole(changedValues.role);
            }
          }}
        >
          <div className="grid grid-cols-2 gap-4">
            <Form.Item
              label={<span className="text-accent font-medium">First Name</span>}
              name="firstName"
              rules={[{ required: true, message: 'Please enter your first name' }]}
            >
              <Input
                className="border-accent focus:border-accent rounded-md"
                placeholder="Enter your first name"
              />
            </Form.Item>
            <Form.Item
              label={<span className="text-accent font-medium">Last Name</span>}
              name="lastName"
              rules={[{ required: true, message: 'Please enter your last name' }]}
            >
              <Input
                className="border-accent focus:border-accent rounded-md"
                placeholder="Enter your last name"
              />
            </Form.Item>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Form.Item
              label={<span className="text-accent font-medium">Gender</span>}
              name="gender"
              rules={[{ required: true, message: 'Please select your gender' }]}
            >
              <Select
                className="border-accent"
                placeholder="Select your gender"
                options={[
                  { value: 'male', label: 'Male' },
                  { value: 'female', label: 'Female' },
                  { value: 'other', label: 'Other' },
                ]}
              />
            </Form.Item>
            <Form.Item
              label={<span className="text-accent font-medium">Role</span>}
              name="role"
              rules={[{ required: true, message: 'Please select your role' }]}
            >
              <Select
                className="border-accent"
                placeholder="Select your role"
                options={[
                  { value: 'patient', label: 'Patient' },
                  { value: 'doctor', label: 'Doctor' },
                  { value: 'admin', label: 'Admin' },
                ]}
              />
            </Form.Item>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Form.Item
              label={<span className="text-accent font-medium">Email</span>}
              name="email"
              rules={[
                { required: true, message: 'Please enter your email' },
                { type: 'email', message: 'Invalid email' },
              ]}
            >
              <Input
                className="border-accent focus:border-accent rounded-md"
                placeholder="Enter your email"
              />
            </Form.Item>
            <Form.Item
              label={<span className="text-accent font-medium">Password</span>}
              name="password"
              rules={[
                { required: true, message: 'Please enter your password' },
                { min: 6, message: 'Password must be at least 6 characters' },
              ]}
            >
              <Input.Password
                className="border-accent focus:border-accent rounded-md"
                placeholder="Enter your password"
              />
            </Form.Item>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Form.Item
              label={<span className="text-accent font-medium">Confirm Password</span>}
              name="confirmPassword"
              dependencies={['password']}
              rules={[
                { required: true, message: 'Please confirm your password' },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue('password') === value) {
                      return Promise.resolve();
                    }
                    return Promise.reject(new Error('Passwords do not match'));
                  },
                }),
              ]}
            >
              <Input.Password
                className="border-accent focus:border-accent rounded-md"
                placeholder="Confirm your password"
              />
            </Form.Item>
            <Form.Item
              label={<span className="text-accent font-medium">Phone</span>}
              name="phone"
            >
              <Input
                className="border-accent focus:border-accent rounded-md"
                placeholder="Enter your phone number"
              />
            </Form.Item>
          </div>
          {role === 'patient' && (
            <div className="grid grid-cols-2 gap-4">
              <Form.Item
                label={<span className="text-accent font-medium">Age</span>}
                name="age"
                rules={[
                  {
                    validator(_, value) {
                      if (!value || (Number(value) >= 0)) {
                        return Promise.resolve();
                      }
                      return Promise.reject(new Error('Age must be a positive number'));
                    },
                  },
                ]}
              >
                <Input
                  type="number"
                  min="0"
                  onKeyDown={preventNegativeInput}
                  className="border-accent focus:border-accent rounded-md"
                  placeholder="Enter your age"
                />
              </Form.Item>
              <Form.Item
                label={<span className="text-accent font-medium">Medical History</span>}
                name="medicalHistory"
              >
                <Input
                  className="border-accent focus:border-accent rounded-md"
                  placeholder="E.g., asthma, diabetes"
                />
              </Form.Item>
            </div>
          )}
          {role === 'doctor' && (
            <div className="grid grid-cols-2 gap-4">
              <Form.Item
                label={<span className="text-accent font-medium">Specialty</span>}
                name="specialty"
                rules={[{ required: true, message: 'Please enter your specialty' }]}
              >
                <Input
                  className="border-accent focus:border-accent rounded-md"
                  placeholder="E.g., Cardiology"
                />
              </Form.Item>
              <Form.Item
                label={<span className="text-accent font-medium">Credentials</span>}
                name="credentials"
                rules={[{ required: true, message: 'Please enter your credentials' }]}
              >
                <Input
                  className="border-accent focus:border-accent rounded-md"
                  placeholder="E.g., MD"
                />
              </Form.Item>
            </div>
          )}
          {role === 'admin' && (
            <div className="grid grid-cols-2 gap-4">
              <Form.Item
                label={<span className="text-accent font-medium">Department</span>}
                name="department"
              >
                <Input
                  className="border-accent focus:border-accent rounded-md"
                  placeholder="E.g., HR"
                />
              </Form.Item>
              <Form.Item
                label={<span className="text-accent font-medium">Designation</span>}
                name="designation"
              >
                <Input
                  className="border-accent focus:border-accent rounded-md"
                  placeholder="E.g., Manager"
                />
              </Form.Item>
            </div>
          )}
          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              className="w-full bg-primary hover:bg-primary-dark text-white border-none h-10 rounded-md"
            >
              Sign Up
            </Button>
          </Form.Item>
          <div className="text-center">
            <Link to="/login" className="text-accent hover:underline text-sm">
              Already have an account? Login here
            </Link>
          </div>
        </Form>
      </div>
    </div>
  );
}

export default Signup;