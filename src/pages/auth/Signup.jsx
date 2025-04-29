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
      console.log('Sending payload:', JSON.stringify(payload, null, 2));

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
              navigate('/patient/dashboard', { replace: true });
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

  const phoneValidator = (_, value) => {
    if (!value) return Promise.resolve();
    const phoneRegex = /^\+?\d{0,4}[-.\s]?\(?\d{1,3}\)?[-.\s]?\d{1,4}[-.\s]?\d{1,4}[-.\s]?\d{1,9}$/;
    if (phoneRegex.test(value) && value.replace(/[^0-9]/g, '').length >= 7) {
      return Promise.resolve();
    }
    return Promise.reject(new Error('Please enter a valid phone number (min 7 digits)'));
  };

  const textValidator = (fieldName) => (_, value) => {
    if (!value) return Promise.resolve();
    if (value.length >= 2 && /^[a-zA-Z0-9\s.-]+$/.test(value)) {
      return Promise.resolve();
    }
    return Promise.reject(new Error(`${fieldName} must be at least 2 characters and contain valid characters`));
  };

  return (
    <div className="form-container">
      <div className="register-form">
        <div className="logo">
          <img src={logo} alt="Clinic Appointment System" className="logo-img" />
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
                data-testid="first-name-input"
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
                data-testid="last-name-input"
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
                data-testid="gender-select"
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
                data-testid="role-select"
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
                data-testid="email-input"
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
                data-testid="password-input"
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
                data-testid="confirm-password-input"
              />
            </Form.Item>
            <Form.Item
              label={<span className="text-accent font-medium">Phone</span>}
              name="phone"
              rules={[phoneValidator]}
            >
              <Input
                className="border-accent focus:border-accent rounded-md"
                placeholder="E.g., 123-456-7890"
                data-testid="phone-input"
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
                      if (!value) return Promise.resolve();
                      const num = Number(value);
                      if (Number.isInteger(num) && num >= 0 && num <= 120) {
                        return Promise.resolve();
                      }
                      return Promise.reject(new Error('Age must be an integer between 0 and 120'));
                    },
                  },
                ]}
              >
                <Input
                  type="number"
                  min="0"
                  max="150"
                  step="1"
                  onKeyDown={preventNegativeInput}
                  className="border-accent focus:border-accent rounded-md"
                  placeholder="Enter your age"
                  data-testid="age-input"
                />
              </Form.Item>
              <Form.Item
                label={<span className="text-accent font-medium">Medical History</span>}
                name="medicalHistory"
              >
                <Input
                  className="border-accent focus:border-accent rounded-md"
                  placeholder="E.g., asthma, diabetes"
                  data-testid="medical-history-input"
                />
              </Form.Item>
            </div>
          )}
          {role === 'doctor' && (
            <div className="grid grid-cols-2 gap-4">
              <Form.Item
                label={<span className="text-accent font-medium">Specialty</span>}
                name="specialty"
                rules={[{ required: true, message: 'Please select your specialty' }]}
              >
                <Select
                  className="border-accent"
                  placeholder="Select your specialty"
                  data-testid="specialty-select"
                  options={[
                    { value: 'Cardiology', label: 'Cardiology' },
                    { value: 'Neurology', label: 'Neurology' },
                    { value: 'Pediatrics', label: 'Pediatrics' },
                    { value: 'Orthopedics', label: 'Orthopedics' },
                    { value: 'Dermatology', label: 'Dermatology' },
                    { value: 'Oncology', label: 'Oncology' },
                    { value: 'Gynecology', label: 'Gynecology' },
                    { value: 'Psychiatry', label: 'Psychiatry' },
                    { value: 'General Surgery', label: 'General Surgery' },
                    { value: 'Endocrinology', label: 'Endocrinology' },
                  ]}
                />
              </Form.Item>
              <Form.Item
                label={<span className="text-accent font-medium">Credentials</span>}
                name="credentials"
                rules={[
                  { required: true, message: 'Please enter your credentials' },
                  textValidator('Credentials'),
                ]}
              >
                <Input
                  className="border-accent focus:border-accent rounded-md"
                  placeholder="E.g., MD, MBBS"
                  data-testid="credentials-input"
                />
              </Form.Item>
            </div>
          )}
          {role === 'admin' && (
            <div className="grid grid-cols-2 gap-4">
              <Form.Item
                label={<span className="text-accent font-medium">Department</span>}
                name="department"
                rules={[textValidator('Department')]}
              >
                <Input
                  className="border-accent focus:border-accent rounded-md"
                  placeholder="E.g., HR"
                  data-testid="department-input"
                />
              </Form.Item>
              <Form.Item
                label={<span className="text-accent font-medium">Designation</span>}
                name="designation"
                rules={[textValidator('Designation')]}
              >
                <Input
                  className="border-accent focus:border-accent rounded-md"
                  placeholder="E.g., Manager"
                  data-testid="designation-input"
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
              data-testid="submit-button"
            >
              Sign Up
            </Button>
          </Form.Item>
          <div className="text-center">
            <Link to="/login" className="text-accent hover:underline text-sm" data-testid="login-link">
              Already have an account? Login here
            </Link>
          </div>
        </Form>
      </div>
    </div>
  );
}

export default Signup;