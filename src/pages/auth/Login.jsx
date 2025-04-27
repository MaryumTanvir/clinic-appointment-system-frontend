import { useState } from 'react';
import { Form, Input, Button, message } from 'antd';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import axios from 'axios';
import logo from '../../assets/logo.png';

function Login() {
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const onFinish = async (values) => {
    setLoading(true);
    try {
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/auth/login`, {
        email: values.email,
        password: values.password,
      });
      console.log('Login response:', response.data);
      if (response.data.success && response.data.user && response.data.token) {
        login(response.data.user, response.data.token);
        message.success('Login successful!');
        // Redirect based on user role
        if (response.data.user.role === 'patient') {
          navigate('/patient/appointments', { replace: true });
        } else if(response.data.user.role === 'admin') {
          navigate('/admin/dashboard', { replace: true }); // Handle other roles later
        }
        else if(response.data.user.role === 'doctor') {
            navigate('/', { replace: true }); // Handle other roles later
        }
        else{
            navigate('/', { replace: true });
        }
      } else {
        message.error('Invalid response from server');
      }
    } catch (err) {
      console.error('Login error:', err);
      message.error(err.response?.data?.message || 'Login failed. Check credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form-container">
      <div className="register-form">
        <div className="logo">
          <img src={logo} alt="Clinic Appointment System" className="logo-img" />
        </div>
        <h3 className="text-2xl font-bold text-accent text-center mb-6">Login</h3>
        <Form
          layout="vertical"
          onFinish={onFinish}
          className="space-y-4"
        >
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
            rules={[{ required: true, message: 'Please enter your password' }]}
          >
            <Input.Password
              className="border-accent focus:border-accent rounded-md"
              placeholder="Enter your password"
            />
          </Form.Item>
          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              className="w-full bg-primary hover:bg-primary-dark text-white border-none h-10 rounded-md"
            >
              Login
            </Button>
          </Form.Item>
          <div className="text-center">
            <Link to="/signup" className="text-accent hover:underline text-sm">
              Not a user? Sign Up here
            </Link>
          </div>
        </Form>
      </div>
    </div>
  );
}

export default Login;