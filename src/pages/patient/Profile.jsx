import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Card, Descriptions, Upload, Button, message, Avatar } from 'antd';
import { User, Upload as UploadIcon } from 'lucide-react';
import Layout from '../../components/patient/Layout';
import moment from 'moment';

const Profile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  const placeholderImage = 'https://placehold.co/100?text=Patient';
  const backendUrl = 'http://localhost:5000'; // Base URL for backend

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${backendUrl}/api/patients/profile`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      console.log('Profile response:', response.data);
      if (response.data.success) {
        setProfile(response.data.data);
        const profileImage = response.data.data.profileImage;
        const newImageUrl = profileImage ? `${backendUrl}${profileImage.replace('/uploads/', '/Uploads/')}` : placeholderImage;
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
      console.log('Upload image response:', response.data);
      if (response.data.success) {
        message.success(response.data.message || 'Profile image updated successfully');
        const newImageUrl = `${backendUrl}${response.data.data.profileImage.replace('/uploads/', '/Uploads/')}`;
        setImageUrl(newImageUrl);
        console.log('handleUpload - imageUrl:', newImageUrl);
        await fetchProfile(); // Refresh profile data
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
    <Layout role="patient">
      <div className="mb-12">
        <h1 className="text-4xl pt-2.5 font-bold flex items-center">
          <User size={32} className="mr-2 text-[#4A628A]" />
          Profile
        </h1>
        <p className="text-gray-600 text-lg">View and update your profile information</p>
      </div>

      <div className="bg-[#B9E5E8] rounded-xl p-6">
        {profile ? (
          <Card className="bg-white rounded-lg">
            <div className="flex flex-col items-center mb-6">
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
                >
                  Upload New Image
                </Button>
              </Upload>
            </div>

            <Descriptions title="User Information" bordered column={1}>
              <Descriptions.Item label="First Name">{profile.firstName}</Descriptions.Item>
              <Descriptions.Item label="Last Name">{profile.lastName}</Descriptions.Item>
              <Descriptions.Item label="Gender">
                {profile.gender.charAt(0).toUpperCase() + profile.gender.slice(1)}
              </Descriptions.Item>
              <Descriptions.Item label="Email">{profile.email}</Descriptions.Item>
              <Descriptions.Item label="Role">
                {profile.role.charAt(0).toUpperCase() + profile.role.slice(1)}
              </Descriptions.Item>
              <Descriptions.Item label="Created At">
                {moment(profile.createdAt).format('YYYY-MM-DD HH:mm')}
              </Descriptions.Item>
              <Descriptions.Item label="Updated At">
                {moment(profile.updatedAt).format('YYYY-MM-DD HH:mm')}
              </Descriptions.Item>
            </Descriptions>

            <Descriptions title="Profile Information" bordered column={1} className="mt-6">
              <Descriptions.Item label="Age">{profile.profile.age || 'N/A'}</Descriptions.Item>
              <Descriptions.Item label="Phone">
                {profile.profile.contact.phone || 'N/A'}
              </Descriptions.Item>
              <Descriptions.Item label="Address">
                {profile.profile.contact.address || 'N/A'}
              </Descriptions.Item>
              <Descriptions.Item label="Medical History">
                {profile.profile.medicalHistory.length > 0
                  ? profile.profile.medicalHistory.join(', ')
                  : 'None'}
              </Descriptions.Item>
            </Descriptions>
          </Card>
        ) : (
          <Card loading={loading} className="bg-white rounded-lg" />
        )}
      </div>
    </Layout>
  );
};

export default Profile;