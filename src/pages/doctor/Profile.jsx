import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Button, Input, Select, message, Upload, Avatar } from 'antd';
import { User, Mail, Briefcase, DollarSign, Phone, MapPin, Lock, Upload as UploadIcon } from 'lucide-react';
import Layout from '../../components/doctor/Layout';

const { Option } = Select;

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

const genderOptions = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
  { value: 'other', label: 'Other' }
];

const Profile = () => {
  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    specialty: '',
    credentials: '',
    consultationFee: '',
    contact: { phone: '', location: '' },
    gender: '',
    password: ''
  });
  const [passwordError, setPasswordError] = useState('');
  const backendUrl = 'http://localhost:5000';
  const placeholderImage = 'https://placehold.co/100?text=Doctor';
  const passwordRegex = /^[a-zA-Z0-9]{6,}$/; // At least 6 characters, letters or numbers only

  useEffect(() => {
    const fetchDoctorProfile = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/doctors/profile`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        const doctorData = response.data.data;
        setDoctor(doctorData);
        setFormData({
          firstName: doctorData.firstName || '',
          lastName: doctorData.lastName || '',
          email: doctorData.email || '',
          specialty: doctorData.specialty || '',
          credentials: doctorData.credentials || '',
          consultationFee: doctorData.consultationFee || '',
          contact: {
            phone: doctorData.contact?.phone || '',
            location: doctorData.contact?.location || ''
          },
          gender: doctorData.gender || '',
          password: ''
        });
        const profileImage = doctorData.profileImage;
        const newImageUrl = profileImage ? `${backendUrl}${profileImage.replace('/uploads/', '/Uploads/')}` : placeholderImage;
        setImageUrl(newImageUrl);
      } catch (error) {
        console.error('Failed to fetch doctor profile:', error);
        message.error('Failed to load profile.');
      }
    };

    fetchDoctorProfile();
  }, []);

  const handleInputChange = (field, value, nestedField = null) => {
    if (field === 'password') {
      if (value && !passwordRegex.test(value)) {
        setPasswordError('Password must be at least 6 characters and contain only letters or numbers');
      } else {
        setPasswordError('');
      }
    }

    if (nestedField) {
      setFormData((prev) => ({
        ...prev,
        [field]: { ...prev[field], [nestedField]: value }
      }));
    } else {
      setFormData((prev) => ({ ...prev, [field]: value }));
    }
  };

  const handleUpdateProfile = async () => {
    if (passwordError) {
      message.error('Please fix the password error before updating.');
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      // Filter out password if empty to preserve existing hashed password
      const payload = { ...formData };
      if (!payload.password) {
        delete payload.password;
      }
      const response = await axios.put(
        `${import.meta.env.VITE_API_URL}/doctors/profile`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      const updatedDoctor = response.data.data;
      setDoctor({
        ...doctor,
        ...updatedDoctor.user,
        specialty: updatedDoctor.doctorProfile.specialty,
        credentials: updatedDoctor.doctorProfile.credentials,
        consultationFee: updatedDoctor.doctorProfile.consultationFee,
        contact: updatedDoctor.doctorProfile.contact
      });
      message.success('Profile updated successfully!');
      setFormData((prev) => ({ ...prev, password: '' }));
      setPasswordError('');
    } catch (error) {
      console.error('Failed to update profile:', error);
      message.error(error.response?.data?.message || 'Failed to update profile.');
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async ({ file }) => {
    if (!file) {
      message.error('Please select an image');
      return;
    }

    const isImage = file.type === 'image/jpeg' || file.type === 'image/png';
    if (!isImage) {
      message.error('You can only upload JPG/PNG files!');
      return;
    }

    const isLt2M = file.size / 1024 / 1024 < 2;
    if (!isLt2M) {
      message.error('Image must be smaller than 2MB!');
      return;
    }

    const formData = new FormData();
    formData.append('profileImage', file);

    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(
        `${backendUrl}/api/users/profile/image`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );
      if (response.data.success) {
        message.success(response.data.message || 'Profile image updated successfully');
        const newImageUrl = `${backendUrl}${response.data.data.profileImage.replace('/uploads/', '/Uploads/')}`;
        setImageUrl(newImageUrl);
        setDoctor((prev) => ({
          ...prev,
          profileImage: response.data.data.profileImage
        }));
      } else {
        message.error(response.data.message || 'Failed to upload image');
      }
    } catch (error) {
      console.error('Upload image error:', error.response?.data || error);
      message.error(error.response?.data?.message || 'Failed to upload image');
    }
  };

  const uploadProps = {
    name: 'file',
    showUploadList: false,
    customRequest: handleUpload,
    accept: 'image/jpeg,image/png'
  };

  return (
    <Layout>
      <div className="p-6 bg-[#B9E5E8] rounded-xl">
        <div className="flex items-center mb-6">
          <div className="flex items-center justify-center w-14 h-14 bg-white rounded-lg shadow-md">
            <User size={28} className="text-[#4A628A]" />
          </div>
          <h1 className="text-3xl font-bold text-[#4A628A] ml-4 leading-tight">
            Profile Settings
          </h1>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200 flex">
          <div className="w-1/4 pr-6 border-r border-gray-200">
            <div className="flex flex-col items-center">
              <Avatar
                src={imageUrl}
                size={100}
                className="profile-image"
                onError={() => {
                  setImageUrl(placeholderImage);
                  return true;
                }}
              />
              <Upload {...uploadProps}>
                <Button
                  icon={<UploadIcon size={16} />}
                  className="mt-4 bg-[#4A628A] text-white border-none"
                >
                  Upload New Image
                </Button>
              </Upload>
            </div>
          </div>

          <div className="w-3/4 pl-6 grid grid-cols-2 gap-4">
            <div>
              <h2 className="text-2xl font-bold text-[#4A628A] mb-4">Current Details</h2>
              <p className="text-sm mb-2">
                <Mail className="inline-block mr-2 text-[#4A628A]" /> Email: {doctor?.email || '...'}
              </p>
              <p className="text-sm mb-2">
                <Briefcase className="inline-block mr-2 text-[#4A628A]" /> Specialty: {doctor?.specialty || '...'}
              </p>
              <p className="text-sm mb-2">
                <DollarSign className="inline-block mr-2 text-[#4A628A]" /> Consultation Fee: {doctor?.consultationFee || '...'}
              </p>
              <p className="text-sm mb-2">
                <Phone className="inline-block mr-2 text-[#4A628A]" /> Phone: {doctor?.contact?.phone || '...'}
              </p>
              <p className="text-sm mb-2">
                <MapPin className="inline-block mr-2 text-[#4A628A]" /> Location: {doctor?.contact?.location || '...'}
              </p>
              <p className="text-sm mb-2">
                <User className="inline-block mr-2 text-[#4A628A]" /> Gender: {doctor?.gender || '...'}
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-[#4A628A] mb-4">Edit Details</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-1">First Name</label>
                  <Input
                    value={formData.firstName}
                    onChange={(e) => handleInputChange('firstName', e.target.value)}
                    size="small"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1">Last Name</label>
                  <Input
                    value={formData.lastName}
                    onChange={(e) => handleInputChange('lastName', e.target.value)}
                    size="small"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1">Email</label>
                  <Input
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    size="small"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1">Specialty</label>
                  <Select
                    value={formData.specialty}
                    onChange={(value) => handleInputChange('specialty', value)}
                    size="small"
                    style={{ width: '100%' }}
                  >
                    {specialtyOptions.map((option) => (
                      <Option key={option.value} value={option.value}>
                        {option.label}
                      </Option>
                    ))}
                  </Select>
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1">Credentials</label>
                  <Input
                    value={formData.credentials}
                    onChange={(e) => handleInputChange('credentials', e.target.value)}
                    size="small"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1">Consultation Fee</label>
                  <Input
                    type="number"
                    value={formData.consultationFee}
                    onChange={(e) => handleInputChange('consultationFee', e.target.value)}
                    size="small"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1">Phone</label>
                  <Input
                    value={formData.contact.phone}
                    onChange={(e) => handleInputChange('contact', e.target.value, 'phone')}
                    size="small"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1">Location</label>
                  <Input
                    value={formData.contact.location}
                    onChange={(e) => handleInputChange('contact', e.target.value, 'location')}
                    size="small"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1">Gender</label>
                  <Select
                    value={formData.gender}
                    onChange={(value) => handleInputChange('gender', value)}
                    size="small"
                    style={{ width: '100%' }}
                  >
                    {genderOptions.map((option) => (
                      <Option key={option.value} value={option.value}>
                        {option.label}
                      </Option>
                    ))}
                  </Select>
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-semibold mb-1">New Password (optional)</label>
                  <Input.Password
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    size="small"
                  />
                  {passwordError && (
                    <p className="text-red-500 text-xs mt-[1px]">{passwordError}</p>
                  )}
                </div>
                <div className="col-span-2 mt-[2px]"></div>
              </div>
              <Button
                type="primary"
                loading={loading}
                onClick={handleUpdateProfile}
                className="w-full mt-6"
                disabled={!!passwordError}
              >
                Update Profile
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Profile;