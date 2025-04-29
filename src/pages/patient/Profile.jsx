import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Button, Input, Select, message, Upload, Avatar } from 'antd';
import { User, Mail, Phone, MapPin, Upload as UploadIcon } from 'lucide-react';
import Layout from '../../components/patient/Layout';
import dayjs from 'dayjs';

const { Option } = Select;

const genderOptions = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
  { value: 'other', label: 'Other' },
];

const Profile = () => {
  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    gender: '',
    profile: {
      age: '',
      contact: { phone: '', address: '' },
      medicalHistory: '',
    },
  });
  const backendUrl = 'http://localhost:5000';
  const placeholderImage = 'https://placehold.co/100?text=Patient';

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${backendUrl}/api/patients/profile`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      console.log('Profile response:', response.data);
      if (response.data.success) {
        const patientData = response.data.data;
        setPatient(patientData);
        setFormData({
          firstName: patientData.firstName || '',
          lastName: patientData.lastName || '',
          email: patientData.email || '',
          gender: patientData.gender || '',
          profile: {
            age: patientData.profile?.age || '',
            contact: {
              phone: patientData.profile?.contact?.phone || '',
              address: patientData.profile?.contact?.address || '',
            },
            medicalHistory: Array.isArray(patientData.profile?.medicalHistory)
              ? patientData.profile.medicalHistory.join(', ')
              : '',
          },
        });
        const profileImage = patientData.profileImage;
        const newImageUrl = profileImage
          ? `${backendUrl}${profileImage.replace('/uploads/', '/Uploads/')}`
          : placeholderImage;
        setImageUrl(newImageUrl);
        console.log('fetchProfile - imageUrl:', newImageUrl);
      } else {
        message.error(response.data.message || 'Failed to load profile');
      }
    } catch (error) {
      console.error('Failed to fetch profile:', error.response?.data || error);
      message.error(error.response?.data?.message || 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleInputChange = (field, value, nestedField = null, subNestedField = null) => {
    if (subNestedField) {
      setFormData((prev) => ({
        ...prev,
        [field]: {
          ...prev[field],
          [nestedField]: { ...prev[field][nestedField], [subNestedField]: value },
        },
      }));
    } else if (nestedField) {
      setFormData((prev) => ({
        ...prev,
        [field]: { ...prev[field], [nestedField]: value },
      }));
    } else {
      setFormData((prev) => ({ ...prev, [field]: value }));
    }
  };

  const handleUpdateProfile = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const payload = {
        ...formData,
        profile: {
          ...formData.profile,
          medicalHistory: formData.profile.medicalHistory
            ? formData.profile.medicalHistory.split(',').map((item) => item.trim())
            : [],
        },
      };
      const response = await axios.put(
        `${backendUrl}/api/patients/profile`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const updatedPatient = response.data.data;
      setPatient({
        ...patient,
        ...updatedPatient,
      });
      message.success('Profile updated successfully!');
    } catch (error) {
      console.error('Failed to update profile:', error.response?.data || error);
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
      message.error('You can only upload JPEG/PNG files!');
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
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      console.log('Upload image response:', response.data);
      if (response.data.success) {
        message.success(response.data.message || 'Profile image updated successfully');
        const newImageUrl = `${backendUrl}${response.data.data.profileImage.replace('/uploads/', '/Uploads/')}`;
        setImageUrl(newImageUrl);
        console.log('handleUpload - imageUrl:', newImageUrl);
        await fetchProfile();
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
    accept: 'image/jpeg,image/png',
  };

  return (
    <Layout role="patient">
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
                  console.error('Failed to load image:', imageUrl);
                  setImageUrl(placeholderImage);
                  return true;
                }}
              />
              <Upload {...uploadProps}>
                <Button
                  icon={<UploadIcon size={16} />}
                  className="mt-4 bg-[#4A628A] text-white border-none"
                  data-testid="upload-image-button"
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
                <User className="inline-block mr-2 text-[#4A628A]" /> Name:{' '}
                {patient?.firstName} {patient?.lastName}
              </p>
              <p className="text-sm mb-2">
                <Mail className="inline-block mr-2 text-[#4A628A]" /> Email:{' '}
                {patient?.email || '...'}
              </p>
              <p className="text-sm mb-2">
                <User className="inline-block mr-2 text-[#4A628A]" /> Gender:{' '}
                {patient?.gender
                  ? patient.gender.charAt(0).toUpperCase() + patient.gender.slice(1)
                  : '...'}
              </p>
              <p className="text-sm mb-2">
                <User className="inline-block mr-2 text-[#4A628A]" /> Age:{' '}
                {patient?.profile?.age || '...'}
              </p>
              <p className="text-sm mb-2">
                <Phone className="inline-block mr-2 text-[#4A628A]" /> Phone:{' '}
                {patient?.profile?.contact?.phone || '...'}
              </p>
              <p className="text-sm mb-2">
                <MapPin className="inline-block mr-2 text-[#4A628A]" /> Address:{' '}
                {patient?.profile?.contact?.address || '...'}
              </p>
              <p className="text-sm mb-2">
                <User className="inline-block mr-2 text-[#4A628A]" /> Medical History:{' '}
                {Array.isArray(patient?.profile?.medicalHistory) && patient.profile.medicalHistory.length > 0
                  ? patient.profile.medicalHistory.join(', ')
                  : 'None'}
              </p>
              <p className="text-sm mb-2">
                <User className="inline-block mr-2 text-[#4A628A]" /> Created At:{' '}
                {patient?.createdAt
                  ? dayjs(patient.createdAt).format('YYYY-MM-DD HH:mm')
                  : '...'}
              </p>
              <p className="text-sm mb-2">
                <User className="inline-block mr-2 text-[#4A628A]" /> Updated At:{' '}
                {patient?.updatedAt
                  ? dayjs(patient.updatedAt).format('YYYY-MM-DD HH:mm')
                  : '...'}
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
                    data-testid="first-name-input"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1">Last Name</label>
                  <Input
                    value={formData.lastName}
                    onChange={(e) => handleInputChange('lastName', e.target.value)}
                    size="small"
                    data-testid="last-name-input"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1">Email</label>
                  <Input
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    size="small"
                    data-testid="email-input"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1">Gender</label>
                  <Select
                    value={formData.gender}
                    onChange={(value) => handleInputChange('gender', value)}
                    size="small"
                    style={{ width: '100%' }}
                    data-testid="gender-select"
                  >
                    {genderOptions.map((option) => (
                      <Option key={option.value} value={option.value}>
                        {option.label}
                      </Option>
                    ))}
                  </Select>
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1">Age</label>
                  <Input
                    type="number"
                    value={formData.profile.age}
                    onChange={(e) => handleInputChange('profile', e.target.value, 'age')}
                    size="small"
                    data-testid="age-input"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1">Phone</label>
                  <Input
                    value={formData.profile.contact.phone}
                    onChange={(e) =>
                      handleInputChange('profile', e.target.value, 'contact', 'phone')
                    }
                    size="small"
                    data-testid="phone-input"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-semibold mb-1">Address</label>
                  <Input
                    value={formData.profile.contact.address}
                    onChange={(e) =>
                      handleInputChange('profile', e.target.value, 'contact', 'address')
                    }
                    size="small"
                    data-testid="address-input"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-semibold mb-1">
                    Medical History (comma-separated)
                  </label>
                  <Input
                    value={formData.profile.medicalHistory}
                    onChange={(e) =>
                      handleInputChange('profile', e.target.value, 'medicalHistory')
                    }
                    size="small"
                    placeholder="e.g., Diabetes, Hypertension"
                    data-testid="medical-history-input"
                  />
                </div>
              </div>
              <Button
                type="primary"
                loading={loading}
                onClick={handleUpdateProfile}
                className="w-full mt-6"
                data-testid="update-profile-button"
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