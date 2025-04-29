import React, { useState, useEffect } from 'react';
import Layout from '../../components/admin/Layout';
import { notification } from 'antd';
import { Pencil } from 'lucide-react';
import axios from 'axios';

const Settings = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    gender: '',
    department: '',
    designation: '',
    phone: '',
    officeLocation: ''
  });

  const [editMode, setEditMode] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('http://localhost:5000/api/admin/profile', {
        headers: { Authorization: `Bearer ${token}` }
      });

      const { user, profile } = res.data.data;

      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        gender: user.gender || '',
        department: profile.department || '',
        designation: profile.designation || '',
        phone: profile.contact?.phone || '',
        officeLocation: profile.contact?.officeLocation || ''
      });
    } catch (error) {
      console.error('Failed to fetch admin profile:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const toggleEdit = (field) => {
    setEditMode((prev) => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      await axios.put('http://localhost:5000/api/admin/profile', formData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      notification.success({
        message: 'Success',
        description: 'Profile updated successfully!'
      });

      fetchAdminData();
      setEditMode({});
    } catch (error) {
      console.error('Failed to update admin profile:', error);
      notification.error({
        message: 'Update Failed',
        description: 'Could not update your profile.'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="h-full">
        <h1 className="text-3xl font-bold mb-2">Settings</h1>
        <p className="text-gray-600 mb-8">Update your information.</p>

        <div className="bg-[#E3F1F1] rounded-lg p-6">
          <form onSubmit={handleSubmit} className="space-y-6">

            {/* Editable Fields */}
            {[
              { label: 'First Name', name: 'firstName' },
              { label: 'Last Name', name: 'lastName' },
              { label: 'Gender', name: 'gender' },
              { label: 'Department', name: 'department' },
              { label: 'Designation', name: 'designation' },
              { label: 'Phone', name: 'phone' },
              { label: 'Office Location', name: 'officeLocation' }
            ].map((field) => (
              <div key={field.name}>
                <label className="block mb-1 text-gray-700">{field.label}</label>
                <div className="flex items-center gap-2">
                  {editMode[field.name] ? (
                    <input
                      type="text"
                      name={field.name}
                      value={formData[field.name]}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border rounded"
                    />
                  ) : (
                    <div className="flex-1 px-3 py-2 bg-white border rounded">
                      {formData[field.name] || '-'}
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={() => toggleEdit(field.name)}
                    className="text-[#4A628A]"
                  >
                    <Pencil size={18} />
                  </button>
                </div>
              </div>
            ))}

            {/* Save Changes Button */}
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 bg-[#4A628A] text-white rounded hover:bg-[#3A5275]"
                style={{ color: 'white' }}
              >
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>

          </form>
        </div>
      </div>
    </Layout>
  );
};

export default Settings;
